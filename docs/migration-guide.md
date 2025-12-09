# Migrasi ke API Proxy Worker - Panduan Produksi

## Overview
File `js/api.js` (current) masih menggunakan kredensial Supabase di sisi klien yang **tidak aman untuk production**. 
File `js/api-proxy.js` menyediakan implementasi yang **lebih aman** menggunakan Cloudflare Worker sebagai proxy.

## Perbedaan Utama

### js/api.js (Klien Langsung)
- ✅ Fungsi komplit untuk produk, auth, imagekit
- ⚠️ Kredensial Supabase terekspos di browser
- ⚠️ Raw database access dari klien
- ⚠️ Tidak aman untuk production

### js/api-proxy.js (Via Worker Proxy)
- ✅ Kredensial disimpan di server (worker)
- ✅ Keamanan tingkat tinggi
- ✅ Semua request difilter melalui server
- ✅ Aman untuk production
- ❌ Memerlukan setup Cloudflare Worker

## Langkah Migrasi ke Production

### 1. Deploy Cloudflare Worker
```bash
cd worker
wrangler deploy
```

### 2. Konfigurasi Environment Variables di Cloudflare Dashboard:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

### 3. Update index.html dan file lainnya:
Ganti referensi ke `js/api.js` dengan `js/api-proxy.js`:

```html
<!-- Ganti di index.html, products.html, admin.html, dll -->
<script src="js/api-proxy.js"></script>
```

### 4. Perbarui file-file komponen:
- Pastikan semua file yang menggunakan `window.tokitaAPI` tetap kompatibel
- File-file seperti `product-grid.js`, `admin.js`, dll akan otomatis menggunakan API yang baru

## Konfigurasi Frontend untuk Production

### Update config.js untuk Production (opsional):
Meskipun kredensial tidak digunakan langsung di production setelah migrasi, tetap jaga agar:
- Tidak menyimpan kredensial di versi production
- Gunakan environment-specific config

### Cek file-file yang menggunakan API:
- [x] js/product-grid.js
- [x] js/product-card.js  
- [x] js/admin.js
- [x] js/login.js

## Best Practice Setelah Migrasi

### 1. Gunakan Hanya API Proxy di Production
- Setelah migrasi, jangan gunakan `js/api.js` di production
- Hapus atau rename file tersebut untuk mencegah penggunaan tidak sengaja

### 2. Implementasi Error Handling
- Worker sekarang menyediakan error handling yang lebih baik
- Frontend harus menangani error dari proxy dengan baik

### 3. Security Headers
- Tambahkan security headers di Cloudflare Worker jika diperlukan
- Implementasikan rate limiting

### 4. Monitoring
- Gunakan Cloudflare Logs untuk monitoring
- Tambahkan custom logging di worker jika diperlukan

## Testing Sebelum Production

### 1. Local Testing
```bash
wrangler dev  # Jalankan worker di lokal
# Update API_BASE_URL di js/api-proxy.js ke URL lokal
```

### 2. Integration Testing
- Test semua fungsi: getAll, getByCategory, create, update, delete
- Test auth flow: login, logout, isAuthenticated
- Test image upload (jika sudah diimplementasikan di worker)

### 3. Security Testing
- Pastikan tidak ada kredensial terekspos
- Test input sanitization
- Test CORS policy

## File-file yang Perlu Diperbarui Setelah Migrasi

1. **HTML Files:**
   - index.html
   - products.html
   - admin.html
   - login.html

2. **Komponen Files:**
   - Semua file javascript yang menggunakan API

3. **Opsional:**
   - Buat `api-production.js` sebagai alias untuk `api-proxy.js`
   - Ganti nama `api-proxy.js` menjadi `api.js` setelah migrasi selesai

## Checklist Production Ready

- [ ] Cloudflare Worker deployed dan berjalan
- [ ] Environment variables diset di Cloudflare
- [ ] Semua API calls menggunakan proxy
- [ ] Error handling diimplementasikan dengan baik
- [ ] Input sanitization bekerja
- [ ] Authentication flow berjalan
- [ ] Product CRUD functions berjalan
- [ ] Tidak ada kredensial terekspos di client
- [ ] CORS policy aman
- [ ] Frontend dapat berjalan tanpa akses langsung ke Supabase

## Rollback Plan
Jika ada masalah, Anda bisa:
1. Kembalikan ke `js/api.js` untuk sementara
2. Pastikan kredensial Supabase diatur di `js/config.js`
3. Tapi INGAT: ini tidak aman untuk production

## Kesimpulan
Dengan migrasi ke API Proxy, Tokita akan memiliki tingkat keamanan yang jauh lebih baik dan siap untuk production deployment.