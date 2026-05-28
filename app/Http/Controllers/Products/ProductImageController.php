<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Services\Products\ProductImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function __construct(
        private readonly ProductImageService $service
    ) {}

    /** Upload satu atau lebih gambar (multipart images[]). */
    public function store(Request $request, string $productId): RedirectResponse
    {
        $request->validate([
            'images'   => ['required', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $count = $this->service->upload($productId, $request->file('images'));

        return back()->with('success', "{$count} gambar berhasil diupload.");
    }

    /** Set gambar sebagai primary / thumbnail utama. */
    public function setPrimary(string $productId, string $imageId): RedirectResponse
    {
        $this->service->setPrimary($productId, $imageId);

        return back()->with('success', 'Gambar utama berhasil diubah.');
    }

    /** Simpan urutan baru hasil drag & drop. Body: { order: [uuid, ...] } */
    public function reorder(Request $request, string $productId): RedirectResponse
    {
        $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['required', 'uuid'],
        ]);

        $this->service->reorder($productId, $request->input('order'));

        return back()->with('success', 'Urutan gambar berhasil disimpan.');
    }

    /** Hapus satu gambar (file fisik + record DB). */
    public function destroy(string $productId, string $imageId): RedirectResponse
    {
        $this->service->delete($productId, $imageId);

        return back()->with('success', 'Gambar berhasil dihapus.');
    }
}
