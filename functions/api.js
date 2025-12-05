export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // --- CONFIGURATION ---
  // Gunakan Environment Variables di Cloudflare Pages untuk keamanan maksimal!
  // Jika tidak ada, gunakan default (HANYA UNTUK DEVELOPMENT).
  const ADMIN_USERNAME = env.ADMIN_USERNAME || "developer";
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "tokita2025"; // GANTI INI DI PROD!
  const JWT_SECRET = env.JWT_SECRET || "rahasia-super-aman-ganti-ini-di-prod-12345";
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyM0UUfQ7gAy9bLv4WF0wv9QKinnHi7IQ1TAFP6m2IbxVC5zF8m441eEXy5fQKJ2z6TEw/exec";
  
  // Allowed Origins (CORS)
  const ALLOWED_ORIGIN = "*"; // Ubah ke domain spesifik saat production, misal: "https://tokita.pages.dev"

  // --- HELPER FUNCTIONS ---

  // 1. Security Headers
  function addSecurityHeaders(headers) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // CSP: Izinkan script dari CDN yang kita pakai (Tailwind, Alpine, ImageKit)
    // Note: Alpine.js requires 'unsafe-eval' for its reactivity system.
    headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://script.google.com https://upload.imagekit.io;");
    return headers;
  }

  // 2. Response Helper
  function jsonResponse(data, status = 200) {
    const headers = new Headers({ "Content-Type": "application/json" });
    addSecurityHeaders(headers);
    return new Response(JSON.stringify(data), { status, headers });
  }

  // 3. Simple JWT Implementation (HMAC SHA-256) using Web Crypto API
  async function signToken(payload) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + (12 * 60 * 60 * 1000) })); // 12 jam
    
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${header}.${body}`));
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    return `${header}.${body}.${signatureBase64}`;
  }

  async function verifyToken(token) {
    try {
      const [headerB64, bodyB64, signatureB64] = token.split('.');
      if (!headerB64 || !bodyB64 || !signatureB64) return null;

      const encoder = new TextEncoder();
      const keyData = encoder.encode(JWT_SECRET);
      const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
      
      const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(`${headerB64}.${bodyB64}`));
      
      if (!isValid) return null;

      const payload = JSON.parse(atob(bodyB64));
      if (payload.exp < Date.now()) return null; // Expired

      return payload;
    } catch (e) {
      return null;
    }
  }

  // --- MAIN LOGIC ---

  const { pathname, searchParams } = url;

  // --- PUBLIC HTMX PRODUCT ROUTES ---
  // This block handles unauthenticated GET requests from the frontend for products.
  // It fetches data, renders HTML, and returns it, bypassing the auth block below.
  if (request.method === "GET" && (pathname.startsWith('/api/products'))) {
    try {
      // Fetch all data from the source
      const gasResponse = await fetch(GAS_URL);
      if (!gasResponse.ok) {
        throw new Error(`GAS request failed with status ${gasResponse.status}`);
      }
      const data = await gasResponse.json();
      const allProducts = (data.products || []).filter(p => 
            p.id && 
            !String(p.id).toLowerCase().includes('kolom') && 
            !String(p.name).includes('Nama Produk')
        );

      // --- Server-side Rendering Logic (adapted from js/products.js) ---
        
      // Get query params
      const category = searchParams.get('category') || 'all';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const ITEMS_PER_PAGE = 8;

      // Filter products
      const filteredProducts = category === 'all'
        ? allProducts
        : allProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());

      // Paginate products
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      // HTML Rendering Function
      function renderProductCards(products) {
          if (!products || products.length === 0) {
              return '<div class="col-span-full text-center py-10 text-gray-500">Belum ada produk untuk kategori ini.</div>';
          }
          return products.map(product => {
              const imageUrl = product.image || 'https://placehold.co/400x300?text=No+Image';
              let displayPrice = product.price;
              if (typeof product.price === 'number') {
                  displayPrice = 'Rp ' + product.price.toLocaleString('id-ID');
              }
              const promoPrice = product.promo_price ? (typeof product.promo_price === 'number' ? 'Rp ' + product.promo_price.toLocaleString('id-ID') : product.promo_price) : null;

              return `
              <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div class="relative">
                      <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=Produk+Tokita';">
                      ${product.rating ? `<div class="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold text-indigo-600">${product.rating} ★</div>` : ''}
                      ${promoPrice ? `<div class="absolute top-2 left-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">PROMO</div>` : ''}
                  </div>
                  <div class="p-5">
                      <div class="flex flex-col h-full justify-between">
                          <div>
                              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.name || 'Nama Produk'}</h3>
                              <p class="mt-1 text-gray-600 text-sm line-clamp-2">${product.description || ''}</p>
                          </div>
                          <div class="mt-4 flex items-center justify-between">
                              <div class="flex flex-col">
                                  ${promoPrice ? `<span class="text-xs text-gray-400 line-through">${displayPrice}</span>` : ''}
                                  <span class="text-lg font-bold text-indigo-600">${promoPrice || displayPrice}</span>
                              </div>
                               <button class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors" hx-post="/api/cart/add" hx-vals='js:{productId: "${product.id}"}' aria-label="Add to cart">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005.92 1H3z" /></svg>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>`;
          }).join('');
      }

      const html = renderProductCards(paginatedProducts);
      
      const headers = new Headers({ "Content-Type": "text/html" });
      addSecurityHeaders(headers);
      
      return new Response(html, { headers });

    } catch (err) {
      console.error('Error in public product route:', err);
      // Return an error message as HTML
      const errorHtml = '<div class="col-span-full text-center py-10 text-red-500">Gagal memuat produk. Silakan coba lagi nanti.</div>';
      return new Response(errorHtml, { status: 500, headers: { "Content-Type": "text/html" }});
    }
  }


  // --- PROTECTED/AUTHENTICATED ROUTES ---

  // Handle OPTIONS (Preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(new Headers()) });
  }

  try {
    // Parse Body if POST
    let body = {};
    if (request.method === "POST") {
      try {
        body = await request.json();
      } catch (e) {
        // Ignore JSON parse error if body is empty
      }
    }

    // Check Action
    const urlParams = new URLSearchParams(url.search);
    const action = body.action || urlParams.get('action');

    // === ROUTE: LOGIN ===
    if (action === 'login') {
      if (request.method !== 'POST') return jsonResponse({ status: 'error', message: 'Method not allowed' }, 405);
      
      if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
        const token = await signToken({ role: 'admin', user: body.username });
        return jsonResponse({ status: 'success', token });
      } else {
        // Delay response to prevent timing attacks
        await new Promise(r => setTimeout(r, 500)); 
        return jsonResponse({ status: 'error', message: 'Invalid credentials' }, 401);
      }
    }

    // === ROUTE: PROTECTED PROXY ===
    // Verify Token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !(await verifyToken(token))) {
      return jsonResponse({ status: 'error', message: 'Unauthorized' }, 401);
    }

    // Prepare Request to GAS
    const targetUrl = new URL(GAS_URL);
    targetUrl.search = url.search; // Forward params

    const init = {
      method: request.method,
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow'
    };

    if (request.method === 'POST') {
      init.body = JSON.stringify(body);
      init.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl.toString(), init);
    const data = await response.text();

    // Return response with Security Headers
    return new Response(data, {
      headers: addSecurityHeaders(new Headers({ "Content-Type": "application/json" }))
    });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}
