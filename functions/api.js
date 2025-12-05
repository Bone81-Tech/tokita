export async function onRequest(context) {
  // URL GAS Backend Anda
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyM0UUfQ7gAy9bLv4WF0wv9QKinnHi7IQ1TAFP6m2IbxVC5zF8m441eEXy5fQKJ2z6TEw/exec";

  const url = new URL(context.request.url);
  const targetUrl = new URL(GAS_URL);
  
  // Forward query params (misal: ?action=auth)
  // Perbaiki: copy search params satu per satu atau assign full
  targetUrl.search = url.search;

  // Siapkan request ke GAS
  const init = {
    method: context.request.method,
    headers: {
      'Accept': 'application/json',
    },
    // Default redirect: 'follow' (Penting karena GAS melakukan redirect 302)
    redirect: 'follow' 
  };

  // Jika POST, kirim body
  if (context.request.method === 'POST') {
    // Kita baca sebagai text/json lalu kirim ulang
    init.body = await context.request.text();
    // GAS butuh Content-Type yang spesifik kadang, tapi text/plain usually safest for CORS avoidance directly.
    // Since we are server side, we can use application/json
    init.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    const data = await response.text();

    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all origins (or spesifik domain Anda)
        "Cache-Control": "no-cache"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', message: err.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
