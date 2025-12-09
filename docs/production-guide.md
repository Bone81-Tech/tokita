# Panduan Production Deployment - Tokita

## Ringkasan
Frontend Tokita sekarang menggunakan Cloudflare Worker sebagai API proxy untuk meningkatkan keamanan dan kinerja.

## Perubahan Penting
- File `js/api.js` telah diganti dengan `js/api-proxy.js`
- Semua permintaan API sekarang melalui Cloudflare Worker proxy
- Kredensial backend tidak lagi terekspos di kode frontend
- Semua file HTML telah diperbarui untuk menggunakan API proxy

## Endpoint Production
Worker URL: `https://tokita-api-proxy.tokitamarket46.workers.dev`

## Daftar File yang Diupdate
- `index.html` - Menggunakan `api-proxy.js` sebagai ganti `api.js`
- `products.html` - Menggunakan `api-proxy.js` sebagai ganti `api.js`
- `admin.html` - Menggunakan `api-proxy.js` sebagai ganti `api.js`
- `login.html` - Menggunakan `api-proxy.js` sebagai ganti `api.js`
- `js/api-proxy.js` - File API utama dengan keamanan tingkat produksi
- `js/utils.js` - Fungsi utilitas tambahan untuk keamanan
- `js/product-grid.js` - Menggunakan API proxy untuk mengambil produk
- `js/admin.js` - Menggunakan API proxy untuk fungsionalitas admin
- `js/login.js` - Menggunakan API proxy untuk autentikasi

## Endpoint API yang Tersedia
### Produk
- `GET /api/products` - Dapatkan semua produk
- `GET /api/products?category=[:category]` - Dapatkan produk berdasarkan kategori
- `POST /api/products` - Buat produk baru (admin only)
- `PUT /api/products/:id` - Update produk (admin only)
- `DELETE /api/products/:id` - Hapus produk (admin only)

### Autentikasi
- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout admin
- `GET /api/auth/user` - Cek status autentikasi

### ImageKit
- `POST /api/imagekit/upload` - Upload gambar produk

## Keamanan
- Semua input disanitasi sebelum ditampilkan
- Output dari API disanitasi untuk mencegah XSS
- Kredensial backend disembunyikan di sisi server
- Validasi parameter diimplementasikan di worker

## Validasi dan Uji Coba
Sebelum deployment production:
1. Test semua fungsi di environment development
2. Pastikan worker Cloudflare aktif dan dapat diakses
3. Verifikasi semua endpoint API berfungsi dengan benar
4. Uji upload gambar produk
5. Test alur admin (login, tambah/edit/hapus produk)

## Rollback Plan
Jika ada masalah kritis, kembalikan ke backup sebelum update API.
Namun, penggunaan API proxy sangat dianjurkan untuk keamanan.

## Catatan Tambahan
- Simpan token autentikasi admin dengan aman
- Monitor log Cloudflare Worker untuk aktivitas mencurigakan
- Backup data produk secara berkala

Frontend Tokita sekarang siap untuk deployment production dengan tingkat keamanan enterprise.