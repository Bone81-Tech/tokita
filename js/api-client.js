// js/api-client.js - API functions using the Cloudflare Functions backend
// This file is the single source of truth for frontend-to-backend communication.

const API_BASE_URL = '/api'; // All requests go to our Functions backend

/**
 * A helper function to manage API requests.
 * It automatically adds the auth token, sets content type, and handles responses.
 * @param {string} endpoint - The API endpoint to call (e.g., '/products').
 * @param {object} [options={}] - Optional fetch options (method, body, etc.).
 * @returns {Promise<any>} - The JSON response from the API.
 */
async function _fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('tokita_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // For DELETE or other methods that might not return a body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null; 
    }

    return response.json();
  } catch (err) {
    console.error(`API call to ${endpoint} failed:`, err);
    throw err;
  }
}


// --- API Modules ---

const productAPI = {
  async getAll() {
    return _fetchAPI('/products');
  },

  async getById(id) {
    const products = await _fetchAPI(`/products?id=eq.${id}&limit=1`);
    // The API returns an array, but we want a single object for getById
    return products[0];
  },

  async getByCategory(category) {
    // Basic validation to prevent unnecessary API calls
    const validCategories = ['sembako', 'makanan', 'minuman', 'rumahtangga'];
    if (!validCategories.includes(category)) {
      console.error(`Invalid category requested: ${category}`);
      return [];
    }
    return _fetchAPI(`/products?category=${category}`);
  },

  async create(product) {
    const validation = validateProductData(product);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    // No need to sanitize here, backend should handle it.
    return _fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(product) {
    if (!product.id) {
      throw new Error('Product ID is required for update.');
    }
    return _fetchAPI(`/products?id=eq.${product.id}`, {
      method: 'PATCH', // Using PATCH for partial updates
      body: JSON.stringify(product),
    });
  },

  async delete(id) {
    return _fetchAPI(`/products?id=eq.${id}`, {
      method: 'DELETE',
    });
  }
};

const authAPI = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error_description || 'Login failed');
    }

    if (data.access_token) {
        localStorage.setItem('tokita_auth_token', data.access_token);
    }
    
    return data;
  },

  async logout() {
    const token = localStorage.getItem('tokita_auth_token');
    if (!token) return; // Already logged out

    await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    localStorage.removeItem('tokita_auth_token');
  },

  // Client-side check. The real verification happens on every API call.
  isAuthenticated() {
    return !!localStorage.getItem('tokita_auth_token');
  }
};

const imagekitAPI = {
  async upload(file) {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided for upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    // The 'fileName' is also required by ImageKit for the signature to match
    formData.append('fileName', file.name);

    const token = localStorage.getItem('tokita_auth_token');

    try {
        const response = await fetch(`${API_BASE_URL}/imagekit/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` // Secure the endpoint
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Image upload failed');
        }

        return response.json();
    } catch (err) {
        console.error('ImageKit upload failed:', err);
        throw err;
    }
  }
};


// --- HELPER & VALIDATION FUNCTIONS (Still useful on the client-side) ---

function validateProductData(product) {
    if (!product) return { valid: false, error: 'Product data is required' };
  
    if (!product.name || product.name.trim() === '') {
      return { valid: false, error: 'Product name is required' };
    }
  
    const price = parseFloat(product.price);
    if (isNaN(price) || price < 0) {
      return { valid: false, error: 'Product price must be a positive number' };
    }
  
    const validCategories = ['sembako', 'makanan', 'minuman', 'rumahtangga'];
    if (!validCategories.includes(product.category)) {
      return { valid: false, error: 'Invalid product category' };
    }
  
    return { valid: true };
}

// Export for use in other files
window.tokitaAPI = { productAPI, authAPI, imagekitAPI };
