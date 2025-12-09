# Konfigurasi Tokita

Untuk menjalankan Tokita dengan benar, Anda perlu mengganti konfigurasi default dengan informasi dari layanan Anda sendiri.

## 1. Konfigurasi Supabase

File: `js/config.js`

Anda harus mengganti placeholder dengan informasi dari proyek Supabase Anda:

```javascript
const config = {
  // Supabase configuration
  supabaseUrl: 'https://[your-project-ref].supabase.co', // GANTI DENGAN URL PROYEK ANDA
  supabaseAnonKey: 'your-anon-key', // GANTI DENGAN ANON KEY ANDA
  
  // ImageKit configuration
  imagekitPublicKey: 'your-imagekit-public-key', // GANTI DENGAN PUBLIC KEY ANDA
  imagekitUrlEndpoint: 'https://ik.imagekit.io/your-imagekit-id' // GANTI DENGAN URL ENDPOINT ANDA
};
```

### Cara mendapatkan informasi Supabase:
1. Login ke https://app.supabase.com
2. Pilih proyek Anda
3. Pergi ke Settings > API
4. Copy "Project URL" dan "anon key (Public)"

## 2. Struktur Tabel yang Dibutuhkan

Pastikan tabel berikut sudah dibuat di Supabase:

### Tabel `products`:
- `id`: TEXT (PRIMARY KEY)
- `name`: TEXT (NOT NULL)
- `description`: TEXT
- `price`: NUMERIC (NOT NULL)
- `promo_price`: NUMERIC
- `category`: TEXT (NOT NULL)
- `image`: TEXT
- `rating`: NUMERIC (DEFAULT 5.0)
- `is_active`: BOOLEAN (DEFAULT TRUE)

## 3. Konfigurasi Otentikasi

Proyek ini menggunakan sistem otentikasi Supabase. Untuk mengakses fungsi admin:

1. Buat user di Supabase Auth
2. Tambahkan metadata ke user dengan struktur:
   ```json
   {
     "role": "admin"
   }
   ```

Lihat `docs/admin-setup.md` untuk detail selengkapnya.

## 4. Error Umum dan Solusi

### Error: "net::ERR_NAME_NOT_RESOLVED"
- Penyebab: URL Supabase salah atau placeholder
- Solusi: Ganti konfigurasi dengan URL proyek Supabase Anda

### Error: "File not found (404)"
- Penyebab: File statis tidak ditemukan
- Solusi: Pastikan struktur folder benar dan file tersedia

### Error: "Failed to fetch"
- Penyebab: Koneksi jaringan atau konfigurasi backend salah
- Solusi: Cek koneksi internet dan konfigurasi backend

## 5. Deployment

Untuk deployment ke production:

1. Pastikan semua konfigurasi sudah benar
2. Update `netlify.toml` atau konfigurasi deployment Anda jika diperlukan
3. Ganti semua placeholder dengan nilai production

File-file penting untuk diperhatikan:
- `js/config.js` - Konfigurasi backend
- `manifest.json` - Konfigurasi PWA
- `netlify.toml` - Konfigurasi deployment (jika menggunakan Netlify)