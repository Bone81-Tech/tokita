# Dokumentasi Frontend Tokita - Vanilla HTML/CSS/JS

Frontend Tokita sekarang menggunakan vanilla HTML, CSS, dan JavaScript tanpa framework.

## Struktur Proyek

```
tokita/
├── index.html              # Halaman beranda
├── products.html          # Halaman katalog produk
├── styles.css             # File CSS utama
├── js/                    # File-file JavaScript
│   ├── config.js          # Konfigurasi Supabase
│   ├── api.js             # Fungsi API Supabase
│   ├── navigation.js      # Komponen navigasi
│   ├── hero.js            # Komponen hero
│   ├── footer.js          # Komponen footer
│   ├── product-grid.js    # Komponen katalog produk
│   ├── product-card.js    # Komponen kartu produk
│   ├── pwa-install.js     # Fungsi PWA
│   └── sw-cleanup.js      # Pembersihan service worker
├── images/                # Gambar-gambar
├── icons/                 # Icon PWA
├── manifest.json          # Konfigurasi PWA
├── sw.js                  # Service worker
├── workbox-*.js           # File workbox
├── docs/                  # Dokumentasi tambahan
├── README.md              # Panduan utama
├── .env.example           # Contoh konfigurasi environment
└── netlify.toml           # Konfigurasi deployment
```

## Konfigurasi Supabase

Untuk menghubungkan ke Supabase, edit file `js/config.js` dan ganti dengan URL dan key dari proyek Supabase Anda:

```javascript
const config = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

## Deployment

Frontend ini dapat dihost di mana saja karena hanya berisi file statis:
- Netlify (dengan konfigurasi di `netlify.toml`)
- Vercel
- GitHub Pages
- Server web statis manapun