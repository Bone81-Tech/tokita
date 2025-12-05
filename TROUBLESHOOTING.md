# Troubleshooting Guide - Tokita Next.js

## ✅ Fixed Issues

### Issue 1: Old HTML Files Served Instead of Next.js Pages

**Problem:**

- Dashboard showing CDN Tailwind warning
- 401 Unauthorized errors on API routes
- Old `dashboard.html` being served instead of Next.js `/dashboard` page

**Root Cause:**
Old HTML files (`index.html`, `dashboard.html`, `developer.html`) were still in repository and being served by Cloudflare Pages instead of Next.js pages.

**Solution:**
Removed all old static files:

```bash
git rm index.html dashboard.html developer.html index-standalone.html
git rm -r functions js src
git rm _headers _routes.json tailwind.config.js
git commit -m "Remove old HTML files and static assets"
git push origin main
```

**Files Removed:**

- `index.html` → Now using `app/page.tsx`
- `dashboard.html` → Now using `app/dashboard/page.tsx`
- `developer.html` → Now using `app/developer/page.tsx`
- `functions/api.js` → Now using `app/api/*/route.ts`
- `js/*.js` → Now using `lib/*.ts`
- `_headers`, `_routes.json` → Cloudflare-specific, not needed for Next.js

**Result:**
✅ Cloudflare Pages will now serve Next.js pages correctly
✅ API routes will work properly
✅ No more CDN Tailwind warnings

---

## Common Issues & Solutions

### 1. Build Fails on Cloudflare Pages

**Error:** `Module not found` or `Cannot find module`

**Solution:**

- Check that all dependencies are in `package.json`
- Verify Node version is 18 or higher
- Clear build cache in Cloudflare Pages settings

### 2. Environment Variables Not Working

**Error:** `undefined` values or authentication failures

**Solution:**

- Double-check all environment variables in Cloudflare Pages settings
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding/updating variables

**Required Variables:**

```
ADMIN_USERNAME
ADMIN_PASSWORD
JWT_SECRET
GAS_URL
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
IMAGEKIT_PRIVATE_KEY
```

### 3. API Routes Return 404

**Error:** `GET /api/auth/login 404 Not Found`

**Solution:**

- Verify build output directory is `.next` (not `out`)
- Check Framework preset is set to "Next.js"
- Ensure API route files are in `app/api/*/route.ts`

### 4. Images Not Loading

**Error:** Images show broken or placeholder

**Solution:**

- Verify ImageKit credentials are correct
- Check `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is set
- Test ImageKit dashboard to ensure account is active

### 5. Authentication Not Working

**Error:** Login fails or redirects to login page

**Solution:**

- Verify `JWT_SECRET` is set and matches between environments
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` are correct
- Clear browser localStorage and try again

### 6. Tailwind Styles Not Applied

**Error:** Page looks unstyled

**Solution:**

- Verify `tailwind.config.ts` includes all content paths
- Check `globals.css` has Tailwind directives
- Run `npm run build` locally to test

### 7. TypeScript Errors in Build

**Error:** Type errors during build

**Solution:**

- Run `npm run lint` locally to see errors
- Fix type errors in code
- Ensure `tsconfig.json` is properly configured

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All old HTML files removed from repository
- [ ] `package.json` has correct dependencies
- [ ] Environment variables set in Cloudflare Pages
- [ ] Build command: `npm run build`
- [ ] Build output: `.next`
- [ ] Framework preset: Next.js
- [ ] Node version: 18 or higher

---

## Verifying Successful Deployment

After deployment, test:

1. **Home Page** (`/`)

   - [ ] Products load from Google Apps Script
   - [ ] Category filters work
   - [ ] Images load from ImageKit
   - [ ] Responsive on mobile

2. **Developer Login** (`/developer`)

   - [ ] Login form displays
   - [ ] Can login with credentials
   - [ ] Redirects to dashboard after login

3. **Dashboard** (`/dashboard`)

   - [ ] Requires authentication
   - [ ] Product list displays
   - [ ] Can create new product
   - [ ] Can upload images to ImageKit
   - [ ] Can edit/delete products

4. **API Routes**
   - [ ] `/api/auth/login` - Returns JWT token
   - [ ] `/api/admin/products` - CRUD operations work
   - [ ] `/api/imagekit/auth` - Returns upload signature

---

## Getting Help

If issues persist:

1. Check Cloudflare Pages build logs
2. Check browser console for errors
3. Verify all environment variables
4. Test locally with `npm run dev`
5. Compare with working deployment

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Check for errors
npm run lint

# View git status
git status

# Push changes
git add .
git commit -m "Your message"
git push origin main
```

---

**Last Updated:** December 5, 2025
