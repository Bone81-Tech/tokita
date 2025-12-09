# Setup Admin User untuk Tokita

Untuk menggunakan fungsi admin di Tokita (menambah, mengedit, menghapus produk), Anda perlu membuat user admin di Supabase.

## Langkah-langkah Pembuatan User Admin:

1. **Login ke Dashboard Supabase**
   - Buka https://app.supabase.com
   - Pilih project Anda

2. **Buka Auth > Users**
   - Klik menu "Authentication" di sidebar kiri
   - Pilih "Users"

3. **Buat User Baru atau Edit User yang Sudah Ada**
   - Untuk membuat user baru: Klik "Invite User" atau "Create a new user"
   - Untuk mengedit user yang sudah ada: Klik user yang ingin dijadikan admin

4. **Tambahkan Metadata untuk Role Admin**
   Pada bagian "User Metadata" atau "Raw User Meta Data", tambahkan:

   ```json
   {
     "role": "admin"
   }
   ```

5. **Pastikan User Email Terverifikasi (Opsional tapi Disarankan)**
   - Centang "Email confirmed at" atau kirim ulang email konfirmasi

## Konfigurasi Supabase:

Pastikan konfigurasi berikut sudah benar di file `js/config.js`:

```javascript
const config = {
  // Supabase configuration
  supabaseUrl: 'https://[your-project-ref].supabase.co', // Ganti dengan URL project Supabase Anda
  supabaseAnonKey: 'your-anon-key', // Ganti dengan anon key dari Settings > API
  
  // ImageKit configuration
  imagekitPublicKey: 'your-imagekit-public-key', // Ganti dengan public key ImageKit Anda
  imagekitUrlEndpoint: 'https://ik.imagekit.io/your-imagekit-id' // Ganti dengan URL endpoint ImageKit Anda
};
```

## Struktur Tabel Products:

Tabel `products` di Supabase memiliki struktur berikut:

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | TEXT (PRIMARY KEY) | ID produk (contoh: PRD1234567890) |
| `name` | TEXT | Nama produk (wajib) |
| `description` | TEXT | Deskripsi produk |
| `price` | NUMERIC | Harga produk (wajib) |
| `promo_price` | NUMERIC | Harga promo (opsional) |
| `category` | TEXT | Kategori produk (sembako, makanan, minuman, rumahtangga) |
| `image` | TEXT | URL gambar produk |
| `rating` | NUMERIC | Rating produk (default: 5.0) |
| `is_active` | BOOLEAN | Status aktif produk (default: TRUE) |
| `created_at` | TIMESTAMP | Tanggal dibuat (diisi otomatis) |
| `updated_at` | TIMESTAMP | Tanggal diupdate (diisi otomatis) |

## Row Level Security (RLS):

Sistem sudah menggunakan RLS untuk memastikan hanya user dengan role "admin" yang bisa:

- Menambah produk baru (INSERT)
- Mengupdate produk (UPDATE)
- Menghapus produk (DELETE)

Sedangkan semua user bisa:

- Melihat produk (SELECT)

## Troubleshooting:

Jika login admin gagal:
1. Pastikan user memiliki role "admin" di metadata
2. Pastikan email sudah terverifikasi (jika disyaratkan)
3. Pastikan konfigurasi Supabase sudah benar
4. Periksa console browser untuk error message