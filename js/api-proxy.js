// js/api-proxy.js - API functions using Cloudflare Worker Proxy

// Import API configuration
const API_BASE_URL = 'https://tokita-api-proxy.tokitamarket46.workers.dev/api';

// Product API functions using proxy
const productAPI = {
  // Get all products
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Sanitize data to prevent XSS
      return Array.isArray(data) ?
        data.map(item => ({
          id: sanitizeOutput(item.id),
          name: sanitizeOutput(item.name),
          description: sanitizeOutput(item.description),
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
          promo_price: item.promo_price ? (typeof item.promo_price === 'number' ? item.promo_price : parseFloat(item.promo_price)) : null,
          category: sanitizeOutput(item.category),
          image: sanitizeUrl(item.image),
          rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating) || 5.0,
          is_active: typeof item.is_active === 'boolean' ? item.is_active : Boolean(item.is_active)
        })) : [];
    } catch (err) {
      console.error('Error in getAll:', err);
      throw err;
    }
  },

  // Get products by category
  async getByCategory(category) {
    // Validate category parameter
    const validCategories = ['sembako', 'makanan', 'minuman', 'rumahtangga'];
    if (!validCategories.includes(category)) {
      console.error(`Invalid category: ${category}`);
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load products by category ${category}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Sanitize data to prevent XSS
      return Array.isArray(data) ?
        data.map(item => ({
          id: sanitizeOutput(item.id),
          name: sanitizeOutput(item.name),
          description: sanitizeOutput(item.description),
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
          promo_price: item.promo_price ? (typeof item.promo_price === 'number' ? item.promo_price : parseFloat(item.promo_price)) : null,
          category: sanitizeOutput(item.category),
          image: sanitizeUrl(item.image),
          rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating) || 5.0,
          is_active: typeof item.is_active === 'boolean' ? item.is_active : Boolean(item.is_active)
        })) : [];
    } catch (err) {
      console.error('Error in getByCategory:', err);
      throw err;
    }
  },

  // Create new product (admin only)
  async create(product) {
    try {
      // Validate product data first
      const validation = validateProductData(product);
      if (!validation.valid) {
        return { status: 'error', message: validation.error };
      }

      // Check authentication first
      if (!(await this.isAuthenticated())) {
        return { status: 'error', message: 'Unauthorized. Please log in.' };
      }

      // Sanitize product data
      const sanitizedProduct = sanitizeProductData(product);
      if (!sanitizedProduct) {
        return { status: 'error', message: 'Invalid product data' };
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokita_auth_token')}` // Assuming token is stored
        },
        body: JSON.stringify(sanitizedProduct)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { status: 'error', message: errorData.message || 'Failed to create product' };
      }

      return { status: 'success', message: 'Product created successfully.' };
    } catch (err) {
      console.error('Error in create:', err);
      return { status: 'error', message: err.message || 'Failed to create product' };
    }
  },

  // Update existing product (admin only)
  async update(product) {
    if (!product.id) {
      return { status: 'error', message: 'Product ID is required for update.' };
    }

    try {
      // Check authentication first
      if (!(await this.isAuthenticated())) {
        return { status: 'error', message: 'Unauthorized. Please log in.' };
      }

      // Sanitize product data
      const sanitizedProduct = sanitizeProductData(product);
      if (!sanitizedProduct) {
        return { status: 'error', message: 'Invalid product data' };
      }

      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(product.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokita_auth_token')}`
        },
        body: JSON.stringify(sanitizedProduct)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { status: 'error', message: errorData.message || 'Failed to update product' };
      }

      return { status: 'success', message: 'Product updated successfully.' };
    } catch (err) {
      console.error('Error in update:', err);
      return { status: 'error', message: err.message || 'Failed to update product' };
    }
  },

  // Delete product (admin only)
  async delete(id) {
    try {
      // Check authentication first
      if (!(await this.isAuthenticated())) {
        return { status: 'error', message: 'Unauthorized. Please log in.' };
      }

      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tokita_auth_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { status: 'error', message: errorData.message || 'Failed to delete product' };
      }

      return { status: 'success', message: 'Product deleted successfully.' };
    } catch (err) {
      console.error('Error in delete:', err);
      return { status: 'error', message: err.message || 'Failed to delete product' };
    }
  }
};

// Authentication functions using proxy
const authAPI = {
  // Login function
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { status: 'error', message: errorData.message || 'Login failed' };
      }

      const data = await response.json();

      // Store auth token
      if (data.token) {
        localStorage.setItem('tokita_auth_token', data.token);
      }

      return { status: 'success', data: data };
    } catch (err) {
      console.error('Login error:', err);
      return { status: 'error', message: err.message || 'Login failed' };
    }
  },

  // Logout function
  async logout() {
    try {
      // Remove auth token
      localStorage.removeItem('tokita_auth_token');

      // Optionally call logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tokita_auth_token')}`
        }
      });

      return { status: 'success', message: 'Logged out successfully' };
    } catch (err) {
      console.error('Logout error:', err);
      return { status: 'error', message: err.message || 'Logout failed' };
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const token = localStorage.getItem('tokita_auth_token');
    if (!token) {
      return false;
    }

    try {
      // Verify token with server
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
};

// ImageKit functions using proxy
const imagekitAPI = {
  // Upload image using proxy
  async upload(file) {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided for upload');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      const response = await fetch(`${API_BASE_URL}/imagekit/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorResult = await response.text();
        throw new Error(`Upload failed: ${errorResult}`);
      }

      const result = await response.json();

      if (!result.url) {
        throw new Error(result.message || 'Upload failed - no URL returned');
      }

      return { url: result.url };
    } catch (err) {
      console.error('ImageKit upload error:', err);
      throw err;
    }
  }
};

// Helper functions for security
function sanitizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);
    // Only allow http/https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.href;
  } catch (e) {
    // Not a valid URL, return empty string
    return '';
  }
}

function sanitizeProductData(product) {
  if (!product) return null;

  return {
    id: sanitizeOutput(product.id),
    name: sanitizeOutput(product.name),
    description: sanitizeOutput(product.description) || '',
    price: parseFloat(product.price) || 0,
    promo_price: product.promo_price ? parseFloat(product.promo_price) : 0,
    category: sanitizeOutput(product.category),
    image: sanitizeUrl(product.image) || '',
    rating: parseFloat(product.rating) || 5.0,
    is_active: typeof product.is_active === 'boolean' ? product.is_active : true
  };
}

function validateProductData(product) {
  if (!product) return { valid: false, error: 'Product data is required' };

  if (!product.name || product.name.trim() === '') {
    return { valid: false, error: 'Product name is required' };
  }

  if (typeof product.price !== 'number' || product.price < 0) {
    return { valid: false, error: 'Product price must be a positive number' };
  }

  const validCategories = ['sembako', 'makanan', 'minuman', 'rumahtangga'];
  if (!validCategories.includes(product.category)) {
    return { valid: false, error: 'Invalid product category' };
  }

  return { valid: true };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { productAPI, authAPI, imagekitAPI };
} else {
  // For browser environment
  window.tokitaAPI = { productAPI, authAPI, imagekitAPI };
}