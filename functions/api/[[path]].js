// functions/api/[[path]].js
// Cloudflare Function to proxy requests to Supabase and ImageKit.
// This file acts as a catch-all for all /api/* requests.

/**
 * MAIN HANDLER for Cloudflare Functions
 * This function intercepts requests, gets secrets from the environment,
 * and routes them to the appropriate handler.
 */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle CORS preflight requests first
  if (method === 'OPTIONS') {
    return handleOptions(request);
  }

  // Get configuration from Cloudflare Pages environment variables
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // Validate required configuration
    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      return errorResponse(500, 'Missing required configuration', 'Supabase URL or Keys not configured in Cloudflare environment.', request);
    }

    let response;

    // Route requests to the appropriate handler
    if (path.startsWith('/api/products')) {
      response = await handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey);
    } else if (path.startsWith('/api/auth')) {
      response = await handleAuth(request, method, url, supabaseUrl, supabaseAnonKey);
    } else if (path.startsWith('/api/imagekit')) {
      response = await handleImageKit(request, method, url, env);
    } else {
      response = new Response('API route not found', { status: 404 });
    }

    // Add CORS headers to the final response
    return addCORSHeaders(response, request.headers.get('Origin'));

  } catch (error) {
    console.error('Root worker error:', error);
    return errorResponse(500, 'Internal Server Error', error.message, request);
  }
}

// --- HANDLER FUNCTIONS ---

async function handleProducts(request, method, url, supabaseUrl, supabaseServiceRoleKey) {
  const headers = {
    'Authorization': `Bearer ${supabaseServiceRoleKey}`,
    'apikey': supabaseServiceRoleKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  let targetUrl = `${supabaseUrl}/rest/v1/products`;

  if (method === 'GET') {
    const params = new URLSearchParams();
    params.append('is_active', 'eq.true'); // Default to active products
    if (url.searchParams.has('category')) {
      params.append('category', 'eq.' + url.searchParams.get('category'));
    }
    params.append('order', 'id.asc');
    targetUrl += '?' + params.toString();
  }

  const supabaseRequest = new Request(targetUrl, {
    method: method,
    headers: headers,
    body: (method !== 'GET' && method !== 'DELETE') ? request.body : undefined
  });

  return fetch(supabaseRequest);
}

async function handleAuth(request, method, url, supabaseUrl, supabaseAnonKey) {
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  const targetUrl = `${supabaseUrl}/auth/v1${url.pathname.substring('/api/auth'.length)}${url.search}`;

  const supabaseRequest = new Request(targetUrl, {
    method: method,
    headers: headers,
    body: (method !== 'GET') ? request.body : undefined
  });

  return fetch(supabaseRequest);
}

async function handleImageKit(request, method, url, env) {
  if (method !== 'POST' || url.pathname !== '/api/imagekit/upload') {
    return new Response('Not Found', { status: 404 });
  }

  const formData = await request.formData();
  
  // This is a dummy signature and will fail.
  // TODO: Replace with real signature generation using SubtleCrypto API.
  const signatureResponse = await generateImageKitSignature(env.IMAGEKIT_PRIVATE_KEY);

  formData.append('publicKey', env.IMAGEKIT_PUBLIC_KEY);
  formData.append('folder', '/tokita_products');
  formData.append('signature', signatureResponse.signature);
  formData.append('expire', signatureResponse.expire);
  formData.append('token', signatureResponse.token);

  const imagekitResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData
  });

  return imagekitResponse;
}


// --- SECURITY & UTILITY FUNCTIONS ---

async function generateImageKitSignature(privateKey) {
  if (!privateKey) {
    console.error("ImageKit private key is not configured.");
    // Return a clearly invalid signature to ensure failure
    return { signature: "invalid-signature-no-private-key", expire: 0, token: "" };
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
  const stringToSign = `token=${token}&expire=${expire}`;

  try {
    // Import the private key for HMAC-SHA1 signing
    const key = await crypto.subtle.importKey(
      "raw", // We are providing the key as a raw byte sequence
      new TextEncoder().encode(privateKey), // The key material
      { name: "HMAC", hash: "SHA-1" }, // Algorithm details
      false, // non-exportable
      ["sign"] // We intend to use this key for signing
    );

    // Sign the string
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(stringToSign)
    );

    // Convert the ArrayBuffer signature to a hexadecimal string
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return { signature, expire, token };

  } catch (error) {
    console.error("Error generating ImageKit signature:", error);
    return { signature: "invalid-signature-crypto-error", expire: 0, token: "" };
  }
}

function handleOptions(request) {
  const headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": headers.get("Origin"),
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
        "Access-Control-Max-Age": "86400",
      }
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        "Allow": "GET, POST, PUT, DELETE, OPTIONS",
      }
    });
  }
}

function addCORSHeaders(response, origin) {
  if (!origin) return response;
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", origin);
  newResponse.headers.set("Vary", "Origin");
  return newResponse;
}

function errorResponse(status, message, details, request) {
  const errorJson = JSON.stringify({ error: message, details: details });
  const response = new Response(errorJson, {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
  return addCORSHeaders(response, request.headers.get('Origin'));
}