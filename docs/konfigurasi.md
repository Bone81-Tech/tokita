# Panduan Konfigurasi dan Penggunaan Frontend Tokita

## Konfigurasi Awal

1. Pastikan Anda memiliki proyek Supabase aktif
2. Dapatkan URL proyek dan anon key dari dashboard Supabase
3. Ganti konfigurasi di file `js/config.js`:

```javascript
const config = {
  supabaseUrl: 'https://[your-project-ref].supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

## Struktur Tabel Supabase

Pastikan Anda memiliki tabel `products` dengan struktur berikut:

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  promo_price INTEGER,
  category TEXT CHECK (category IN ('sembako', 'makanan', 'minuman', 'rumahtangga')),
  image TEXT,
  rating TEXT
);
```

## Pengembangan Lokal

Frontend ini dapat dijalankan secara lokal menggunakan server statis seperti:

### Live Server (VS Code)
Gunakan ekstensi Live Server untuk VS Code dan buka `index.html`.

### Python HTTP Server
```bash
python -m http.server 8000
```

### Node HTTP Server
```bash
npx http-server
```

## PWA (Progressive Web App)

Aplikasi ini mendukung fitur PWA:
- Dapat diinstal di perangkat
- Bekerja offline (sebagian)
- Ikon dan tema sesuai brand Tokita

## Kontribusi

Struktur file JavaScript dipisah untuk kemudahan pengembangan:
- Setiap komponen berada di file terpisah
- Menggunakan vanilla JavaScript tanpa framework
- Mudah dimodifikasi dan dipahami