// Tokita API Proxy Worker
// Fungsi untuk proxy request ke Supabase dan ImageKit

// Konfigurasi Supabase
const SUPABASE_URL = 'https://your-project.supabase.co'; // Akan diganti dengan env var
const SUPABASE_ANON_KEY = 'your-anon-key'; // Akan diganti dengan env var
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key'; // Akan diganti dengan env var

// Handler untuk request
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Tangani permintaan CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Update konfigurasi dari environment variables
    const supabaseUrl = env.SUPABASE_URL || SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY;

    try {
      let response;

      // Endpoint untuk produk
      if (path.startsWith('/api/products')) {
        response = await handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey);
      }
      // Endpoint untuk auth
      else if (path.startsWith('/api/auth')) {
        response = await handleAuth(request, method, url, supabaseUrl, supabaseAnonKey);
      }
      // Endpoint untuk image upload
      else if (path.startsWith('/api/imagekit')) {
        response = await handleImageKit(request, method, url, env);
      }
      // Jika bukan API request yang dikenali, kembalikan 404
      else {
        response = new Response('Not Found', { status: 404 });
      }

      // Tambahkan header CORS ke response
      const origin = request.headers.get('Origin') || '*';
      return addCORSHeaders(response, origin);

    } catch (error) {
      console.error('Worker error:', error);
      const response = new Response(JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
        path: path
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      const origin = request.headers.get('Origin') || '*';
      return addCORSHeaders(response, origin);
    }
  }
};

// Fungsi untuk menangani request produk
async function handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey) {
  try {
    const headers = {
      'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      'apikey': supabaseServiceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // Extract category jika ada
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('is_active');

    // Buat URL tujuan untuk Supabase
    let targetUrl = `${supabaseUrl}/rest/v1/products`;

    if (method === 'GET') {
      // Tambahkan filter untuk request GET
      const params = new URLSearchParams();

      if (isActive) params.append('is_active', 'eq.' + isActive);
      else params.append('is_active', 'eq.true'); // Default hanya produk aktif

      if (category) params.append('category', 'eq.' + category);

      params.append('order', 'id.asc');
      targetUrl += '?' + params.toString();
    }

    // Buat request ke Supabase
    const supabaseRequest = new Request(targetUrl, {
      method: method,
      headers: headers,
      body: method !== 'GET' && method !== 'DELETE' ? await request.text() : undefined
    });

    const response = await fetch(supabaseRequest);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in handleProducts:', error);
    return new Response(JSON.stringify({ error: 'Error processing products request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Fungsi untuk menangani auth
async function handleAuth(request, method, url, supabaseUrl, supabaseAnonKey) {
  try {
    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    };

    // Redirect ke Supabase auth
    const targetUrl = `${supabaseUrl}/auth/v1${url.pathname.substring('/api/auth'.length)}${url.search}`;

    const supabaseRequest = new Request(targetUrl, {
      method: method,
      headers: headers,
      body: method !== 'GET' ? await request.text() : undefined
    });

    const response = await fetch(supabaseRequest);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in handleAuth:', error);
    return new Response(JSON.stringify({ error: 'Error processing auth request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Fungsi untuk menangani ImageKit
async function handleImageKit(request, method, url, env) {
  try {
    if (method === 'POST' && url.pathname === '/api/imagekit/upload') {
      // Ambil file dari request
      const formData = await request.formData();

      // Siapkan form data untuk ImageKit
      const imagekitFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        imagekitFormData.append(key, value);
      }

      // Tambahkan parameter ImageKit
      imagekitFormData.append('publicKey', env.IMAGEKIT_PUBLIC_KEY);
      imagekitFormData.append('folder', '/tokita_products');

      // Generate signature untuk upload
      // Ini seharusnya dilakukan di backend, bukan di client
      // Kita akan menggunakan server-side signature generation
      const signatureResponse = await generateImageKitSignature(env.IMAGEKIT_PRIVATE_KEY);
      imagekitFormData.append('signature', signatureResponse.signature);
      imagekitFormData.append('expire', signatureResponse.expire);
      imagekitFormData.append('token', signatureResponse.token);

      const imagekitResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: imagekitFormData
      });

      const result = await imagekitResponse.json();
      return new Response(JSON.stringify(result), {
        status: imagekitResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error in handleImageKit:', error);
    return new Response(JSON.stringify({ error: 'Error processing imagekit request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Fungsi untuk generate signature ImageKit (implementasi dummy - seharusnya diganti dengan implementasi yang benar)
async function generateImageKitSignature(privateKey) {
  try {
    // Dalam implementasi nyata, ini akan menghasilkan signature yang benar
    // berdasarkan timestamp dan private key menggunakan algoritma yang benar
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
    const token = 'dummy-token-' + Date.now(); // Seharusnya digenerate dengan benar
    const signature = 'dummy-signature-' + Math.random().toString(36).substr(2, 9); // Seharusnya dihasilkan dari algoritma HMAC

    return {
      signature: signature,
      expire: expire,
      token: token
    };
  } catch (error) {
    console.error('Error in generateImageKitSignature:', error);
    return {
      signature: 'fallback-signature',
      expire: Math.floor(Date.now() / 1000) + 3600,
      token: 'fallback-token'
    };
  }
}

// Fungsi untuk menangani permintaan CORS OPTIONS preflight
function handleOptions(request) {
  const origin = request.headers.get("Origin");

  // Daftar origin yang diizinkan (untuk production sebaiknya disesuaikan)
  const allowedOrigins = [
    'https://tokita.pages.dev',
    'https://www.tokita.pages.dev',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://tokita-api-proxy.tokitamarket46.workers.dev' // Origin sendiri jika diperlukan
  ];

  // Cek apakah origin diizinkan, jika tidak gunakan wildcard
  const isValidOrigin = origin && allowedOrigins.some(allowed => origin === allowed);
  const corsOrigin = isValidOrigin ? origin : '*';

  // Ambil header preflight request
  const accessControlRequestMethod = request.headers.get("Access-Control-Request-Method");
  const accessControlRequestHeaders = request.headers.get("Access-Control-Request-Headers");

  if (origin !== null && accessControlRequestMethod !== null) {
    // Menangani permintaan CORS preflight
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": accessControlRequestMethod,
        "Access-Control-Allow-Headers": accessControlRequestHeaders || "Content-Type, Authorization, X-Requested-With, Accept, Origin, Referer, User-Agent",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
      },
    });
  } else {
    // Menangani permintaan OPTIONS standar
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        Allow: "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
      },
    });
  }
}

// Fungsi untuk menambahkan header CORS ke response
function addCORSHeaders(response, origin) {
  // Daftar origin yang diizinkan (untuk production sebaiknya disesuaikan)
  const allowedOrigins = [
    'https://tokita.pages.dev',
    'https://www.tokita.pages.dev',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://tokita-api-proxy.tokitamarket46.workers.dev' // Origin sendiri jika diperlukan
  ];

  // Cek apakah origin diizinkan, jika tidak gunakan wildcard
  const isValidOrigin = origin && allowedOrigins.some(allowed => origin === allowed);
  const corsOrigin = isValidOrigin ? origin : '*';

  // Clone response agar bisa dimanipulasi
  const responseClone = new Response(response.body, response);

  // Tambahkan header CORS sambil menjaga header asli
  responseClone.headers.append("Access-Control-Allow-Origin", corsOrigin);
  responseClone.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
  responseClone.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Referer, User-Agent");
  responseClone.headers.append("Access-Control-Allow-Credentials", "true");
  responseClone.headers.append("Access-Control-Max-Age", "86400");

  // Tambahkan header Vary untuk browser caching
  responseClone.headers.append("Vary", "Origin");

  return responseClone;
}