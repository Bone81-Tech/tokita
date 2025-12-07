// Cloudflare Worker untuk Proxy Google Apps Script
// Mengatasi masalah CORS

const TARGET_URL = 'https://script.google.com/macros/s/AKfycbyM0UUfQ7gAy9bLv4WF0wv9QKinnHi7IQ1TAFP6m2IbxVC5zF8m441eEXy5fQKJ2z6TEw/exec';

// Daftar origin yang diizinkan
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://tokita.pages.dev',
  'https://your-custom-domain.com' // Ganti dengan domain Anda
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return handleOptions(request, origin);
    }

    try {
      // Buat request baru ke Google Apps Script
      const targetUrl = TARGET_URL + url.search;

      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.text()
          : undefined,
      });

      // Forward request ke Google Apps Script
      const response = await fetch(modifiedRequest);

      // Clone response agar bisa dimodifikasi
      const modifiedResponse = new Response(response.body, response);

      // Tambahkan CORS headers
      modifiedResponse.headers.set('Access-Control-Allow-Origin',
        ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
      );
      modifiedResponse.headers.set('Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      modifiedResponse.headers.set('Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      modifiedResponse.headers.set('Access-Control-Max-Age', '86400');

      return modifiedResponse;
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Proxy error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin)
            ? origin
            : ALLOWED_ORIGINS[0],
        }
      });
    }
  }
};

function handleOptions(request, origin) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  return new Response(null, {
    status: 204,
    headers: headers
  });
}
