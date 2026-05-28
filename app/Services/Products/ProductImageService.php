<?php

namespace App\Services\Products;

use App\Models\ProductImage;
use App\Models\Products;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        $product       = $this->findProduct($productId);
        $existingCount = $product->images()->count();

        foreach ($files as $index => $file) {
            $path = $file->storeAs(
                "products/{$product->tenant_id}",
                Str::uuid() . '.' . $file->getClientOriginalExtension(),
                'public'
            );

            ProductImage::create([
                'tenant_id'  => $product->tenant_id,
                'product_id' => $product->id,
                'url'        => Storage::disk('public')->url($path),
                'path'       => $path,
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
        $product    = $this->findProduct($productId);
        $image      = $product->images()->findOrFail($imageId);
        $wasPrimary = $image->is_primary;

        $image->delete(); // file fisik dihapus via model booted()

        if ($wasPrimary) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }
    }
}
