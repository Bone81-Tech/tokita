# Tokita Product Showcase

Welcome to the Tokita product showcase website. This is a modern, responsive product display built with HTMX, Alpine.js, and Tailwind CSS, optimized for Cloudflare Pages hosting.

## Features

- Responsive product showcase layout
- Dynamic content loading with HTMX
- Interactive components with Alpine.js
- Optimized images with ImageKit.io
- Product filtering by category
- "Load more" functionality

## Technologies Used

- **HTMX**: For dynamic content loading without complex JavaScript
- **Alpine.js**: For lightweight interactivity
- **Tailwind CSS**: For styling and responsive design
- **ImageKit.io**: For optimized image delivery
- **Cloudflare Pages**: For hosting and CDN

## Project Structure

```
tokita/
├── index.html          # Main HTML file
├── tailwind.config.js  # Tailwind CSS configuration
├── js/
│   ├── products.js     # Product data and rendering logic
│   ├── api.js          # API endpoint simulations
│   └── imagekit.js     # ImageKit integration
├── _headers            # Cloudflare Pages headers configuration
├── _routes.json        # Cloudflare Pages routing configuration
└── README.md           # This file
```

## Deployment to Cloudflare Pages

1. Push your code to a GitHub repository
2. Log in to Cloudflare Dashboard and go to Pages
3. Click "Create a project" and connect to your GitHub repository
4. Configure build settings:
   - Build command: `npm run build` (if using build process) or leave empty for static site
   - Build output directory: `.` (or your public directory)
5. Click "Save and Deploy"

## Local Development

To run locally:

1. Open `index.html` in your browser directly, or
2. Use a local server like `http-server` or Python's `http.server`

## ImageKit Configuration

To use your own ImageKit account:

1. Update the `imagekitConfig` in `js/imagekit.js` with your credentials:
   - `publicKey`: Your ImageKit public key
   - `urlEndpoint`: Your ImageKit URL endpoint
   - `authenticationEndpoint`: Your authentication endpoint (if needed)

## Customization

- Update the product data in `js/products.js`
- Modify styling in `index.html` or add your own CSS
- Change colors and themes in the Tailwind configuration
- Update the navigation in the HTML

## Performance Optimization

The site is optimized for performance with:
- Lazy loading images
- CDN-delivered assets
- Optimized image formats via ImageKit
- Minimal JavaScript
- Efficient HTMX requests