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
    headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://script.google.com https://upload.imagekit.io;");
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
