# Deployment Guide - Tokita Next.js

## ✅ Pre-Deployment Checklist

- [x] Code migrated to Next.js 15
- [x] Build successful (0 errors)
- [x] 0 vulnerabilities
- [x] Pushed to GitHub via SSH
- [ ] Deploy to Cloudflare Pages

## 🚀 Deploy ke Cloudflare Pages

### Step 1: Akses Cloudflare Dashboard

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Pages** dari sidebar
3. Click **Create a project**

### Step 2: Connect Repository

1. Click **Connect to Git**
2. Pilih **GitHub**
3. Authorize Cloudflare Pages (jika belum)
4. Pilih repository: `Bone81-Tech/tokita`
5. Click **Begin setup**

### Step 3: Configure Build Settings

**Framework preset:** Next.js

**Build configuration:**

- **Production branch:** `main`
- **Build command:** `npm run build`
- **Build output directory:** `.next`
- **Root directory:** `/` (leave empty)

**Advanced settings:**

- **Node version:** `18` atau `20`

### Step 4: Environment Variables

Tambahkan environment variables berikut di **Environment variables** section:

```
ADMIN_USERNAME=developer
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-super-secret-jwt-key-change-this
GAS_URL=https://script.google.com/macros/s/AKfycbyM0UUfQ7gAy9bLv4WF0wv9QKinnHi7IQ1TAFP6m2IbxVC5zF8m441eEXy5fQKJ2z6TEw/exec
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yzsmfytxo
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

**PENTING:**

- Ganti `your-secure-password-here` dengan password yang aman
- Ganti `your-super-secret-jwt-key-change-this` dengan random string
- Pastikan semua ImageKit credentials sudah benar

### Step 5: Deploy

1. Click **Save and Deploy**
2. Tunggu proses build selesai (±2-3 menit)
3. Setelah selesai, Anda akan mendapat URL deployment

### Step 6: Verify Deployment

Test halaman-halaman berikut:

1. **Home Page:** `https://your-site.pages.dev/`

   - ✅ Product catalog tampil
   - ✅ Category filter berfungsi
   - ✅ Responsive design

2. **Developer Login:** `https://your-site.pages.dev/developer`

   - ✅ Form login tampil
   - ✅ Login dengan credentials yang sudah diset

3. **Dashboard:** `https://your-site.pages.dev/dashboard`
   - ✅ Product list tampil
   - ✅ CRUD operations berfungsi
   - ✅ Image upload ke ImageKit berfungsi

## 🔧 Troubleshooting

### Build Failed

**Error:** `Module not found` atau `Cannot find module`

- **Solusi:** Pastikan semua dependencies sudah di-install dengan `npm install`

**Error:** `Environment variable not found`

- **Solusi:** Periksa kembali environment variables di Cloudflare Pages settings

### API Routes Not Working

**Error:** `404 Not Found` pada `/api/*`

- **Solusi:** Pastikan build output directory adalah `.next` bukan `out`
- **Solusi:** Cloudflare Pages harus detect Next.js framework

### Authentication Issues

**Error:** Login tidak berfungsi

- **Solusi:** Periksa `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `JWT_SECRET` di environment variables

### Image Upload Failed

**Error:** Upload ke ImageKit gagal

- **Solusi:** Periksa `IMAGEKIT_PRIVATE_KEY` dan `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
- **Solusi:** Pastikan ImageKit account aktif

## 🔄 Update Deployment

Untuk update deployment di masa depan:

1. Push changes ke GitHub:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. Cloudflare Pages akan otomatis rebuild dan deploy

## 📊 Monitoring

- **Build logs:** Cloudflare Pages Dashboard → Your Project → Deployments
- **Analytics:** Cloudflare Pages Dashboard → Your Project → Analytics
- **Custom domain:** Cloudflare Pages Dashboard → Your Project → Custom domains

## 🎉 Selesai!

Aplikasi Tokita Next.js Anda sudah live di Cloudflare Pages!

**Next Steps:**

- Setup custom domain (opsional)
- Enable Cloudflare Analytics
- Monitor performance dengan Web Vitals
- Add more features sesuai kebutuhan
