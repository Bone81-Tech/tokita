// js/config.js - Configuration for Tokita

// Configuration for Supabase and ImageKit
// To use with your own services:
// 1. Supabase: Go to https://supabase.com and create a new project
//    Get your project URL and anon key from Settings > API
// 2. ImageKit: Go to https://imagekit.io and create a new media library
//    Get your public key from Your Profile > Access Keys

const config = {
  // Supabase configuration
  supabaseUrl: 'https://your-project.supabase.co', // Replace with your actual Supabase project URL
  supabaseAnonKey: 'your-anon-key', // Replace with your actual Supabase anon key

  // ImageKit configuration
  imagekitPublicKey: 'your-imagekit-public-key', // Replace with your ImageKit public key
  imagekitUrlEndpoint: 'https://ik.imagekit.io/your-imagekit-id' // Replace with your ImageKit URL endpoint
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.tokitaConfig = config;
}