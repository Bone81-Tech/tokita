// js/config.js - Configuration for Tokita

// Configuration for Supabase and ImageKit
// To use with your own services:
// 1. Supabase: Go to https://supabase.com and create a new project
//    Get your project URL and anon key from Settings > API
// 2. ImageKit: Go to https://imagekit.io and create a new media library
//    Get your public key from Your Profile > Access Keys

const config = {
  // Supabase configuration
  supabaseUrl: 'https://asmkuckxyvakbhqkgzta.supabase.co', // Replace with your actual Supabase project URL
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbWt1Y2t4eXZha2JocWtnenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDU5MzUsImV4cCI6MjA4MDcyMTkzNX0.l-yFD3N9Mmpdj6YbLjr5_QEoaWOniakPmFeNETSGoeQ', // Replace with your actual Supabase anon key

  // ImageKit configuration
  imagekitPublicKey: 'public_5WUQChxNeRX0f4FjcSErK/v/XXM=', // Replace with your ImageKit public key
  imagekitUrlEndpoint: 'https://ik.imagekit.io/yzsmfytxo/' // Replace with your ImageKit URL endpoint
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.tokitaConfig = config;
}