<?php

namespace App\Services\Products;

use App\Models\ProductImage;
use App\Models\Products;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductImageService
{
    private function tenantId(): string
    {
        return auth()->user()->tenant_id;
    }

    private function findProduct(string $productId): Products
    {
        return Products::forCurrentUser()->findOrFail($productId);
    }

    /** Upload array of UploadedFile, kembalikan jumlah yang berhasil. */
    public function upload(string $productId, array $files): int
    {
        $product = $this->findProduct($productId);
        $existingCount = $product->images()->count();

        foreach ($files as $index => $file) {
            $path = $file->storeAs(
                "products/{$product->tenant_id}",
                Str::uuid().'.'.$file->getClientOriginalExtension(),
                'public'
            );

            ProductImage::create([
                'tenant_id' => $product->tenant_id,
                'product_id' => $product->id,
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
                'is_primary' => ($existingCount === 0 && $index === 0),
                'sort_order' => $existingCount + $index,
            ]);
        }

        return count($files);
    }

    /** Set satu gambar sebagai primary, reset yang lain. */
    public function setPrimary(string $productId, string $imageId): void
    {
        $product = $this->findProduct($productId);
        $product->images()->update(['is_primary' => false]);
        $product->images()->where('id', $imageId)->update(['is_primary' => true]);
    }

    /** Simpan urutan baru dari array UUID. */
    public function reorder(string $productId, array $orderedIds): void
    {
        $product = $this->findProduct($productId);

        foreach ($orderedIds as $index => $imageId) {
            $product->images()->where('id', $imageId)->update(['sort_order' => $index]);
        }
    }

    /** Hapus satu gambar (file fisik + record). */
    public function delete(string $productId, string $imageId): void
    {
        $product = $this->findProduct($productId);
        $image = $product->images()->findOrFail($imageId);
        $wasPrimary = $image->is_primary;

        $image->delete(); // file fisik dihapus via model booted()

        if ($wasPrimary) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }
    }

    public function downloadFromUrl(string $productId, string $imageUrl): bool
    {
        $product = $this->findProduct($productId);
        $existingCount = $product->images()->count();

        try {
            // Fetch remote image contents with standard user-agent
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            ])->timeout(15)->get($imageUrl);

            if ($response->failed()) {
                return false;
            }

            $contents = $response->body();
            
            // Get content-type to deduce extension
            $contentType = $response->header('Content-Type');
            $ext = 'jpg';
            if (str_contains($contentType, 'png')) {
                $ext = 'png';
            } elseif (str_contains($contentType, 'webp')) {
                $ext = 'webp';
            } elseif (str_contains($contentType, 'gif')) {
                $ext = 'gif';
            }

            $uuid = Str::uuid();
            $path = "products/{$product->tenant_id}/{$uuid}.{$ext}";

            // Store inside public disk
            Storage::disk('public')->put($path, $contents);

            ProductImage::create([
                'tenant_id' => $product->tenant_id,
                'product_id' => $product->id,
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
                'is_primary' => ($existingCount === 0),
                'sort_order' => $existingCount,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('AI Image Import Error: ' . $e->getMessage());
            return false;
        }
    }
}
