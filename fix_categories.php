<?php

use App\Models\ProductCategory;
use App\Models\Products;
use Illuminate\Support\Facades\DB;

// Ambil semua kategori yang namanya 'minuman' (case insensitive)
$categories = ProductCategory::whereRaw('LOWER(name) = ?', ['minuman'])->get();

if ($categories->count() > 1) {
    // Ambil satu untuk disimpan (misalnya yang pertama)
    $keep = $categories->first();
    // Update namanya jadi terstandarisasi
    $keep->name = 'Minuman';
    $keep->save();

    echo "Menyimpan kategori utama: ID {$keep->id} ({$keep->name})\n";

    // Loop sisanya, pindahkan produk, lalu hapus
    foreach ($categories as $cat) {
        if ($cat->id !== $keep->id) {
            echo "Memindahkan produk dari kategori ID {$cat->id} ({$cat->name}) ke ID {$keep->id}...\n";
            $updatedCount = Products::where('category_id', $cat->id)->update(['category_id' => $keep->id]);
            echo "  - $updatedCount produk dipindahkan.\n";
            
            echo "Menghapus kategori ID {$cat->id}...\n";
            $cat->delete();
        }
    }
    echo "Selesai!\n";
} else {
    echo "Hanya ada " . $categories->count() . " kategori 'minuman'. Tidak ada duplikat yang perlu dihapus.\n";
}
