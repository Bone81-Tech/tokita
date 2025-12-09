# Tokita - Vanilla Frontend Product Showcase

Modern e-commerce product showcase built with vanilla HTML, CSS, and JavaScript. Frontend ringan tanpa framework untuk kinerja maksimal dan kemudahan deployment.

## 🚀 Features

- **Vanilla HTML/CSS/JS** - Tanpa framework, ringan dan cepat
- **Responsive Design** - Tampil optimal di semua perangkat
- **PWA Support** - Bisa diinstal sebagai aplikasi
- **Supabase Integration** - Backend database
- **Static Deployment** - Mudah dihost di mana saja

## 📋 Prerequisites

- Web server statis (untuk deployment)
- Supabase project (untuk data produk)

## 🛠️ Penggunaan Lokal

Buka file `index.html` langsung di browser atau gunakan server statis:

### Live Server (VS Code)
Gunakan ekstensi Live Server dan buka `index.html`.

### Node HTTP Server
```bash
npx http-server
```

### Python HTTP Server
```bash
python -m http.server 8000
```

## ⚙️ Konfigurasi

1. Buat proyek di [Supabase](https://supabase.io)
2. Ganti konfigurasi di `js/config.js`:

```javascript
const config = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

3. Pastikan tabel `products` di Supabase memiliki struktur yang sesuai

## 📦 Deployment

Frontend ini dapat dideploy ke berbagai platform karena hanya berisi file statis:

### Netlify
File `netlify.toml` sudah disertakan untuk konfigurasi otomatis.

### Vercel
Secara otomatis mendeteksi proyek statis.

### GitHub Pages
Upload ke branch `gh-pages`.

### Server Statis
Cukup upload file-file ke web server Anda.

## 🗂️ Struktur Proyek

Lihat dokumentasi lengkap di folder `docs/` untuk informasi tentang struktur proyek dan konfigurasi.

## 🎨 Kustomisasi

### Warna & Gaya

Ubah file `styles.css` untuk mengganti gaya visual.

### Produk

Produk dikelola melalui:
1. Backend Supabase
2. Tabel `products` dengan struktur yang ditentukan

## 🐛 Troubleshooting

### Gambar Tidak Muncul

Pastikan folder `images/` berisi file yang benar dan path di file HTML sesuai.

### API Tidak Bekerja

Pastikan konfigurasi Supabase di `js/config.js` sudah benar.

## 📄 License

ISC

## 👤 Author

Bone81-Tech
