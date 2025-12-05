// Security headers helper
export function getSecurityHeaders(): HeadersInit {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://script.google.com https://upload.imagekit.io",
    ].join('; '),
  };
}

// CORS headers
export function getCORSHeaders(origin = '*'): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Combine all security headers
export function getAllSecurityHeaders(origin = '*'): HeadersInit {
  return {
    ...getSecurityHeaders(),
    ...getCORSHeaders(origin),
  };
}
