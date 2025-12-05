# Tokita - Next.js Product Showcase

Modern e-commerce product showcase built with Next.js, TypeScript, and Tailwind CSS. Migrated from static HTML to Next.js framework for better performance and developer experience.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v3** for styling
- **Authentication** with JWT tokens
- **Admin Dashboard** for product management
- **ImageKit Integration** for optimized images
- **Google Apps Script** backend
- **Cloudflare Pages** deployment ready

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Google Apps Script API (already configured)
- ImageKit account
- Cloudflare Pages account

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Bone81-Tech/tokita.git
cd tokita
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:

```env
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
GAS_URL=your-google-apps-script-url
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your-imagekit-endpoint
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
```

## 🏃 Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## 📦 Deployment to Cloudflare Pages

### Method 1: Using Wrangler CLI

1. Install Wrangler globally (if not already installed):

```bash
npm install -g wrangler
```

2. Login to Cloudflare:

```bash
wrangler login
```

3. Build for Cloudflare Pages:

```bash
npm run pages:build
```

4. Deploy:

```bash
npm run pages:deploy
```

### Method 2: Using Cloudflare Dashboard

1. Push your code to GitHub

2. Go to Cloudflare Dashboard → Pages

3. Click "Create a project" → "Connect to Git"

4. Select your repository

5. Configure build settings:

   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`

6. Add environment variables in Cloudflare Pages settings:

   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `GAS_URL`
   - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
   - `IMAGEKIT_PRIVATE_KEY`

7. Click "Save and Deploy"

## 📁 Project Structure

```
tokita/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── auth/            # Authentication
│   │   └── imagekit/        # ImageKit integration
│   ├── dashboard/           # Admin dashboard page
│   ├── developer/           # Login page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Navigation.tsx
│   ├── ProductCard.tsx
│   └── ProductGrid.tsx
├── lib/                     # Utility libraries
│   ├── api.ts              # API client
│   ├── auth.ts             # Authentication utilities
│   ├── imagekit.ts         # ImageKit helpers
│   └── security.ts         # Security headers
├── types/                   # TypeScript types
│   └── index.ts
├── public/                  # Static assets
│   └── images/
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

## 🔐 Authentication

The application uses JWT-based authentication for the admin dashboard.

**Default credentials** (change in production):

- Username: `developer`
- Password: `tokita2025`

Access the admin dashboard at `/developer`

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: { ... },
  secondary: { ... }
}
```

### Products

Products are managed through:

1. Admin Dashboard at `/dashboard`
2. Google Apps Script backend
3. ImageKit for image storage

## 📝 API Routes

- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/admin/products` - CRUD operations for products
- `GET /api/imagekit/auth` - Get ImageKit upload credentials

## 🔧 Environment Variables

| Variable                            | Description            | Required |
| ----------------------------------- | ---------------------- | -------- |
| `ADMIN_USERNAME`                    | Admin username         | Yes      |
| `ADMIN_PASSWORD`                    | Admin password         | Yes      |
| `JWT_SECRET`                        | JWT signing secret     | Yes      |
| `GAS_URL`                           | Google Apps Script URL | Yes      |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`   | ImageKit public key    | Yes      |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit endpoint      | Yes      |
| `IMAGEKIT_PRIVATE_KEY`              | ImageKit private key   | Yes      |

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors, try:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors

Make sure all dependencies are installed:

```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

## 📄 License

ISC

## 👤 Author

Bone81-Tech

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- ImageKit for image optimization
- Google Apps Script for the backend API
