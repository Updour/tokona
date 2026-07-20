<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductImportController extends Controller
{
    public function importFromUrl(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'url'],
        ]);

        $url = $request->input('url');

        try {
            // 1. Fetch HTML content with standard User-Agent to bypass simple bot detection
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            ])->timeout(30)->get($url);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil konten dari URL. Pastikan link dapat diakses publik atau coba lagi.',
                ], 400);
            }

            $html = $response->body();

            // 2. Parse basic Open Graph tags as fallback
            $ogData = $this->parseOpenGraph($html);

            $geminiKey = env('GEMINI_API_KEY');
            $aiData = null;
            if ($geminiKey) {
                // Use Gemini AI for parsing and cleaning up data
                $aiData = $this->parseWithGemini($html, $ogData, $geminiKey);
            }

            $name = $aiData ? $aiData['name'] : ($ogData['title'] ?? '');
            $price = $aiData ? $aiData['sell_price'] : ($ogData['price'] ?? 0);
            $description = $aiData ? $aiData['description'] : ($ogData['description'] ?? '');
            $imageUrl = $aiData ? $aiData['image_url'] : ($ogData['image'] ?? '');
            $unit = $aiData ? ($aiData['unit'] ?? 'Pcs') : 'Pcs';
            $category = $aiData ? ($aiData['category'] ?? '') : '';
            $type = $aiData ? ($aiData['type'] ?? '') : '';

            // Clean up promo tags in brackets (e.g. [SPESIAL], [PROMO]) at the beginning of the title
            $name = preg_replace('/^\[[^\]]+\]\s*/i', '', $name);

            return response()->json([
                'success' => true,
                'data' => [
                    'name' => trim($name),
                    'sell_price' => $price,
                    'description' => $description,
                    'unit' => $unit,
                    'category' => $category,
                    'type' => $type,
                    'image_url' => $imageUrl,
                ],
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI Product Import Timeout: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Koneksi ke toko online timeout (lambat). Silakan ulangi beberapa saat lagi.',
            ], 408);
        } catch (\Exception $e) {
            Log::error('AI Product Import Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat memproses impor produk.',
            ], 500);
        }
    }

    private function parseOpenGraph(string $html): array
    {
        $data = [
            'title' => '',
            'description' => '',
            'image' => '',
            'price' => 0,
        ];

        // Match title
        if (preg_match('/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            $data['title'] = html_entity_decode($matches[1]);
        } elseif (preg_match('/<title>([^<]+)<\/title>/i', $html, $matches)) {
            $data['title'] = trim(html_entity_decode($matches[1]));
        }

        // Match description
        if (preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            $data['description'] = html_entity_decode($matches[1]);
        } elseif (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            $data['description'] = html_entity_decode($matches[1]);
        }

        // Match image
        if (preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            $data['image'] = $matches[1];
        }

        // Match price (commonly structured inside JSON-LD or meta tags)
        if (preg_match('/<meta[^>]*property=["\']product:price:amount["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            $data['price'] = (float) $matches[1];
        }

        return $data;
    }

    private function parseWithGemini(string $html, array $ogData, string $apiKey): ?array
    {
        // Extract JSON-LD before stripping scripts
        $jsonLd = '';
        if (preg_match_all('/<script type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $html, $matches)) {
            $jsonLd = implode("\n", $matches[1]);
        }

        // Remove script, style, and svg elements for the rest of HTML
        $cleanHtml = preg_replace('/<(script|style|svg)\b[^>]*>(.*?)<\/\1>/is', '', $html);
        $cleanHtml = strip_tags($cleanHtml);
        $cleanHtml = preg_replace('/\s+/', ' ', $cleanHtml);
        $cleanHtml = substr($cleanHtml, 0, 5000); // Take first 5000 characters of text

        // Get existing categories and types for better matching
        $tenantId = auth()->check() ? auth()->user()->tenant_id : null;
        $existingCategories = $tenantId ? \App\Models\ProductCategory::where('tenant_id', $tenantId)->pluck('name')->toArray() : [];
        $existingTypes = $tenantId ? \App\Models\ProductType::where('tenant_id', $tenantId)->pluck('name')->toArray() : [];
        
        $catStr = !empty($existingCategories) ? implode(", ", $existingCategories) : "Belum ada kategori";
        $typeStr = !empty($existingTypes) ? implode(", ", $existingTypes) : "Belum ada tipe";

        $prompt = "Tugas Anda adalah mengekstrak informasi produk dari metadata web, JSON-LD, dan teks HTML berikut menjadi JSON.
Format JSON harus memiliki key berikut (hanya key ini):
- 'name': Nama produk bersih.
- 'price': Harga jual (angka saja).
- 'description': Deskripsi produk (string).
- 'unit': Satuan (Pcs, Kg, Box, Botol, dsb. Default: 'Pcs').
- 'category': Kategori. UTAMAKAN memilih dari daftar kategori berikut jika cocok: [{$catStr}]. Jika tidak ada yang cocok sama sekali, buat nama kategori baru yang singkat (max 2 kata).
- 'type': Tipe produk. UTAMAKAN memilih dari daftar tipe berikut jika cocok: [{$typeStr}]. Jika tidak ada, buat nama baru singkat.
- 'image_url': URL gambar.

Data JSON-LD (Sangat Penting):
{$jsonLd}

Metadata Open Graph:
- Title: {$ogData['title']}
- Description: {$ogData['description']}
- Image URL: {$ogData['image']}
- Price: {$ogData['price']}

Konten Teks Halaman Web:
{$cleanHtml}

Kembalikan HANYA string JSON mentah. Jangan berikan penjelasan teks, dan jangan gunakan penutup markdown seperti ```json.";

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $resultText = $response->json('candidates.0.content.parts.0.text');
                
                // Clean markdown code blocks if any
                $resultText = preg_replace('/^```(?:json)?/i', '', $resultText);
                $resultText = preg_replace('/```$/', '', $resultText);
                $resultText = trim($resultText);

                $decoded = json_decode($resultText, true);

                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return [
                        'name' => $decoded['name'] ?? $ogData['title'],
                        'sell_price' => isset($decoded['price']) ? (int) $decoded['price'] : (int) $ogData['price'],
                        'description' => $decoded['description'] ?? $ogData['description'],
                        'unit' => $decoded['unit'] ?? 'Pcs',
                        'category' => $decoded['category'] ?? '',
                        'type' => $decoded['type'] ?? '',
                        'image_url' => $decoded['image_url'] ?? $ogData['image'],
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Gemini Import Integration Error: ' . $e->getMessage());
        }

        return null;
    }
}
