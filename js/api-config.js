// js/api-config.js - API Configuration for Tokita Production

// Production API configuration using Cloudflare Worker proxy
const API_CONFIG = {
  // Production endpoint - using Cloudflare Worker proxy
  BASE_URL: 'https://tokita-api-proxy.tokitamarket46.workers.dev/api',
  
  // Development endpoint - uncomment when needed for testing
  // BASE_URL: 'http://localhost:8787/api', // For local worker development
  
  // Headers for API requests
  HEADERS: {
    'Content-Type': 'application/json',
    // Authorization can be added dynamically when needed
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG };
} else {
  window.TOKITA_API_CONFIG = { API_CONFIG };
}