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

    // Update konfigurasi dari environment variables
    const supabaseUrl = env.SUPABASE_URL || SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY;

    try {
      // Endpoint untuk produk
      if (path.startsWith('/api/products')) {
        return await handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey);
      }
      
      // Endpoint untuk auth
      if (path.startsWith('/api/auth')) {
        return await handleAuth(request, method, url, supabaseUrl, supabaseAnonKey);
      }
      
      // Endpoint untuk image upload
      if (path.startsWith('/api/imagekit')) {
        return await handleImageKit(request, method, url, env);
      }
      
      // Jika bukan API request, kembalikan 404
      return new Response('Not Found', { status: 404 });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// Fungsi untuk menangani request produk
async function handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey) {
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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// Fungsi untuk menangani auth
async function handleAuth(request, method, url, supabaseUrl, supabaseAnonKey) {
  if (method === 'OPTIONS') {
    return handleCORS();
  }

  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  // Redirect ke Supabase auth
  const targetUrl = `${supabaseUrl}/auth/v1/${url.pathname.replace('/api/auth/', '')}${url.search}`;
  
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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// Fungsi untuk menangani ImageKit
async function handleImageKit(request, method, url, env) {
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
}

// Fungsi untuk generate signature ImageKit (implementasi dummy - seharusnya diganti dengan implementasi yang benar)
async function generateImageKitSignature(privateKey) {
  // Dalam implementasi nyata, ini akan menghasilkan signature yang benar
  // berdasarkan timestamp dan private key menggunakan algoritma yang benar
  const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
  const token = 'dummy-token'; // Seharusnya digenerate dengan benar
  const signature = 'dummy-signature'; // Seharusnya dihasilkan dari algoritma HMAC
  
  return {
    signature: signature,
    expire: expire,
    token: token
  };
}

// Fungsi untuk CORS
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}