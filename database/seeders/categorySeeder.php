<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class categorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Minuman',
            'Makanan',
            'Snack',
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat
            ]);
        }
    }
}
