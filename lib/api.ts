import type { Product, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authenticated fetch wrapper
async function fetchAuthAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tokita_token') : null;
  
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

// Product API
export const productAPI = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const data = await fetchAPI<ApiResponse>('/products');
    return data.products || [];
  },

  // Get products by category
  async getByCategory(category: string): Promise<Product[]> {
    const data = await fetchAPI<ApiResponse>(`/products/filter?category=${category}`);
    return data.products || [];
  },

  // Create product (authenticated)
  async create(product: Partial<Product>): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>('/admin/products', {
      method: 'POST',
      body: JSON.stringify({ action: 'create_product', data: product }),
    });
  },

  // Update product (authenticated)
  async update(product: Product): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>('/admin/products', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_product', data: product }),
    });
  },

  // Delete product (authenticated)
  async delete(id: string): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>('/admin/products', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_product', id }),
    });
  },
};

// Auth API
export const authAPI = {
  // Login
  async login(username: string, password: string): Promise<{ status: string; token?: string; message?: string }> {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Verify token
  async verify(token: string): Promise<boolean> {
    try {
      const response = await fetchAPI('/auth/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 'success';
    } catch {
      return false;
    }
  },
};

// ImageKit API
export const imagekitAPI = {
  // Get authentication parameters
  async getAuthParams(): Promise<{ signature: string; expire: number; token: string }> {
    return fetchAuthAPI('/imagekit/auth');
  },

  // Upload image
  async upload(file: File): Promise<{ url: string }> {
    const authParams = await this.getAuthParams();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
    formData.append('signature', authParams.signature);
    formData.append('expire', authParams.expire.toString());
    formData.append('token', authParams.token);
    formData.append('useUniqueFileName', 'true');
    formData.append('folder', '/tokita_products');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!result.url) {
      throw new Error(result.message || 'Upload failed');
    }

    return { url: result.url };
  },
};
