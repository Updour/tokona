# Panduan Penjelasan Perhitungan Dashboard Tokona

Dokumen ini menjelaskan secara rinci bagaimana angka **Nilai Aset Stok**, **Potensi Harga Jual**, dan **Proyeksi Laba Kotor** dihitung pada Dashboard Utama Tokona, menggunakan contoh nyata dari data toko Anda saat ini (Tenant: **`sanbox`**).

---

## 1. Definisi Istilah Dashboard

| Nama Kartu | Definisi Akuntansi | Rumus Perhitungan |
| :--- | :--- | :--- |
| **Nilai Aset Stok** | Total nilai barang yang Anda miliki saat ini, dihitung berdasarkan **harga modal/beli** (HPP). Ini adalah representasi nilai aset nyata di neraca keuangan. | $\text{Stok} \times \text{Harga Modal (Cost)}$ |
| **Potensi Harga Jual** | Total uang yang akan Anda terima jika seluruh stok barang tersebut berhasil terjual habis dengan **harga jual** saat ini. | $\text{Stok} \times \text{Harga Jual (Price)}$ |
| **Proyeksi Laba Kotor** | Estimasi total keuntungan kotor yang akan Anda peroleh jika seluruh stok barang saat ini terjual habis. | $\text{Potensi Harga Jual} - \text{Nilai Aset Stok}$ <br>atau<br> $\text{Stok} \times (\text{Harga Jual} - \text{Harga Modal})$ |

---

## 2. Rincian Data Produk Toko Anda (Saat Ini)

Toko Anda memiliki **3 produk (SKU)** dengan rincian harga dan stok sebagai berikut:

### A. MIE SEDAAP (Karton)
* **Jumlah Stok:** 20 karton
* **Harga Modal (Cost):** Rp 102.000 / karton
* **Harga Jual (Price):** Rp 107.500 / karton
* **Perhitungan:**
  * Nilai Aset (Modal) = $20 \times \text{Rp 102.000} = \mathbf{\text{Rp 2.040.000}}$
  * Potensi Jual = $20 \times \text{Rp 107.500} = \mathbf{\text{Rp 2.150.000}}$
  * Proyeksi Laba = $\text{Rp 2.150.000} - \text{Rp 2.040.000} = \mathbf{\text{Rp 110.000}}$

### B. Kopi Kapal Api (Karton)
* **Jumlah Stok:** 15 karton
* **Harga Modal (Cost):** Rp 164.000 / karton
* **Harga Jual (Price):** Rp 175.000 / karton
* **Perhitungan:**
  * Nilai Aset (Modal) = $15 \times \text{Rp 164.000} = \mathbf{\text{Rp 2.460.000}}$
  * Potensi Jual = $15 \times \text{Rp 175.000} = \mathbf{\text{Rp 2.625.000}}$
  * Proyeksi Laba = $\text{Rp 2.625.000} - \text{Rp 2.460.000} = \mathbf{\text{Rp 165.000}}$

### C. SOKLIN DETERGEN (Karton)
* **Jumlah Stok:** 70 karton
* **Harga Modal (Cost):** Rp 93.000 / karton
* **Harga Jual (Price):** Rp 98.000 / karton
* **Perhitungan:**
  * Nilai Aset (Modal) = $70 \times \text{Rp 93.000} = \mathbf{\text{Rp 6.510.000}}$
  * Potensi Jual = $70 \times \text{Rp 98.000} = \mathbf{\text{Rp 6.860.000}}$
  * Proyeksi Laba = $\text{Rp 6.860.000} - \text{Rp 6.510.000} = \mathbf{\text{Rp 350.000}}$

---

## 3. Akumulasi Total Pada Dashboard Anda

Jika kita menjumlahkan seluruh perhitungan di atas, berikut adalah hasil akhirnya yang tampil di Dashboard Utama Anda:

1. **Nilai Aset Stok (Total Modal):**
   $$\text{Rp 2.040.000} \text{ (Mie)} + \text{Rp 2.460.000} \text{ (Kopi)} + \text{Rp 6.510.000} \text{ (Soklin)} = \mathbf{\text{Rp 11.010.000}}$$

2. **Potensi Harga Jual (Total Omset):**
   $$\text{Rp 2.150.000} \text{ (Mie)} + \text{Rp 2.625.000} \text{ (Kopi)} + \text{Rp 6.860.000} \text{ (Soklin)} = \mathbf{\text{Rp 11.635.000}}$$

3. **Proyeksi Laba Kotor (Total Keuntungan):**
   $$\text{Rp 110.000} \text{ (Mie)} + \text{Rp 165.000} \text{ (Kopi)} + \text{Rp 350.000} \text{ (Soklin)} = \mathbf{\text{Rp 625.000}}$$
   *(Atau dihitung dari: $\text{Rp 11.635.000} \text{ (Potensi Jual)} - \text{Rp 11.010.000} \text{ (Nilai Aset)} = \mathbf{\text{Rp 625.000}}$)*

---

## 4. Analisis Mengapa Margin Terasa Kecil

Keuntungan kotor Anda diproyeksikan sebesar **Rp 625.000** dari total aset **Rp 11.010.000** (hanya sekitar **5.6%** dari total modal). Hal ini disebabkan oleh:

* **Selisih Harga Modal & Jual Soklin Detergen Terlalu Tipis:**
  Soklin Detergen memiliki stok terbanyak (70 karton), namun harga modalnya adalah **Rp 93.000** dan harga jualnya adalah **Rp 98.000** (hanya untung Rp 5.000 per karton). 
* **Jika Ada Kesalahan Input:**
  Jika sebenarnya harga modal Soklin Detergen adalah **Rp 83.000** (bukan Rp 93.000), maka:
  * Nilai Aset Stok Soklin menjadi: $70 \times \text{Rp 83.000} = \text{Rp 5.810.000}$
  * Nilai Aset Stok Total menjadi: **Rp 10.310.000**
  * Keuntungan per karton Soklin menjadi: Rp 15.000
  * Proyeksi Laba Kotor Total menjadi: **Rp 1.325.000**

---

## 5. Cara Mengubah Data Harga Modal/Jual

Jika Anda ingin menyesuaikan data agar sesuai dengan keadaan toko yang sebenarnya:
1. Buka menu **Produk** $\rightarrow$ **Semua Produk**.
2. Klik tombol **Edit** (ikon pensil) pada produk yang ingin disesuaikan (misal SOKLIN DETERGEN).
3. Ubah nilai pada kolom **HPP (Harga Pokok)** atau **Harga Jual**.
4. Simpan perubahan. Dashboard Utama akan otomatis memperbarui perhitungan dalam beberapa menit (karena adanya cache sistem selama 3 menit).
