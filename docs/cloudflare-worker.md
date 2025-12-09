# Cloudflare Worker API Proxy untuk Tokita

## Overview
Cloudflare Worker ini berfungsi sebagai API proxy untuk:
- Mengamankan kredensial Supabase (anon key & service role key)
- Mengamankan private key ImageKit
- Menyediakan endpoint API yang lebih aman untuk frontend vanilla

## Struktur Worker

### Endpoint yang Tersedia

1. **Produk API**
   - `GET /api/products` - Mendapatkan semua produk
   - `GET /api/products?category=[category]` - Mendapatkan produk berdasarkan kategori
   - `POST /api/products` - Menambah produk (admin only)
   - `PUT /api/products/[id]` - Mengupdate produk (admin only)
   - `DELETE /api/products/[id]` - Menghapus produk (admin only)

2. **Autentikasi API**
   - `POST /api/auth/login` - Login
   - `POST /api/auth/logout` - Logout
   - `GET /api/auth/user` - Mendapatkan user info

3. **ImageKit API**
   - `POST /api/imagekit/upload` - Upload gambar (akan diimplementasikan)

## Konfigurasi Environment Variables

Anda perlu mengatur variabel lingkungan berikut di Cloudflare Dashboard:

### Di Cloudflare Dashboard:
1. Pergi ke Workers & Pages > Your Worker
2. Settings > Environment Variables
3. Tambahkan variabel berikut:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

## Deployment

### 1. Deployment ke Cloudflare Workers

```bash
# Install Wrangler (jika belum)
npm install -g wrangler

# Login ke Cloudflare
wrangler login

# Deploy worker
cd worker
wrangler deploy
```

### 2. Konfigurasi Custom Domain (opsional)
- Anda bisa menautkan domain custom ke worker Anda
- Misalnya: `api.tokita.com` -> worker Anda

## Perubahan di Frontend

Setelah worker aktif, Anda harus memperbarui file `js/api.js` untuk menggunakan endpoint worker:

```javascript
// Ganti BASE URL di api.js
const API_BASE_URL = 'https://your-worker.your-account.workers.dev/api';

// Dan gunakan endpoint ini:
const productAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/products`);
    // ... lanjutkan dengan pemrosesan
  },
  
  async getByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/products?category=${category}`);
    // ... lanjutkan dengan pemrosesan
  }
  
  // ... fungsi lainnya
};
```

## Security Benefits

1. **Kredensial Terlindungi** - Tidak akan terekspos di frontend
2. **Validasi Input** - Bisa ditambahkan di worker untuk validasi tambahan
3. **Rate Limiting** - Bisa diimplementasikan di worker
4. **Logging & Monitoring** - Lebih mudah dilakukan di server-side

## Development

Untuk development lokal, Anda bisa menggunakan:

```bash
# Jalankan worker di lokal
wrangler dev

# Akses di http://localhost:8787
```

Pastikan untuk mengatur `.dev.vars` untuk development lokal:

```
SUPABASE_URL=your_dev_supabase_url
SUPABASE_ANON_KEY=your_dev_supabase_anon_key
# ... dan seterusnya
```

## Penanganan Error

Worker ini juga menangani error dengan:
- Logging error ke Cloudflare
- Response error format JSON
- Penanganan CORS untuk request cross-origin

## Troubleshooting

### Jika API tidak merespon:
1. Pastikan environment variables sudah benar
2. Cek log di Cloudflare Dashboard
3. Pastikan Supabase project settings benar (RLS policies, etc)

### Jika upload image gagal:
1. Periksa apakah ImageKit keys benar
2. Pastikan folder ImageKit sudah dibuat

Dengan implementasi ini, frontend Tokita menjadi jauh lebih aman dan tetap mempertahankan fungsionalitasnya!