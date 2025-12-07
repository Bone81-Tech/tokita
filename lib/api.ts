import type { Product, ApiResponse } from '@/types';

// Cloudflare Worker Proxy URL (mengatasi CORS)
const GAS_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tokita-proxy.tokitamarket46.workers.dev';

// Generic fetch wrapper with error handling
async function fetchAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
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
  
  // For GAS, we send token in body instead of headers
  const body = options?.body ? JSON.parse(options.body as string) : {};
  body.token = token;
  
  return fetchAPI<T>(endpoint, {
    ...options,
    body: JSON.stringify(body),
  });
}

// Product API
export const productAPI = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const data = await fetchAPI<ApiResponse>(`${GAS_URL}?cacheBust=${new Date().getTime()}`);
    return data.products || [];
  },

  // Get products by category
  async getByCategory(category: string): Promise<Product[]> {
    const data = await fetchAPI<ApiResponse>(`${GAS_URL}?category=${category}`);
    return data.products || [];
  },

  // Create product (authenticated)
  async create(product: Partial<Product>): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'create_product', data: product }),
    });
  },

  // Update product (authenticated)
  async update(product: Product): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_product', data: product }),
    });
  },

  // Delete product (authenticated)
  async delete(id: string): Promise<ApiResponse> {
    return fetchAuthAPI<ApiResponse>(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_product', id }),
    });
  },
};

// Auth API - Direct to GAS
export const authAPI = {
  // Login
  async login(username: string, password: string): Promise<{ status: string; token?: string; message?: string }> {
    return fetchAPI(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username, password }),
    });
  },

  // Verify token
  async verify(token: string): Promise<boolean> {
    try {
      const response = await fetchAPI(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', token }),
      });
      return response.status === 'success';
    } catch {
      return false;
    }
  },
};

// ImageKit API - Direct to GAS for auth, then to ImageKit for upload
export const imagekitAPI = {
  // Get authentication parameters from GAS
  async getAuthParams(): Promise<{ signature: string; expire: number; token: string; publicKey?: string; } | { status: string; message: string; }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tokita_token') : null;
    return fetchAPI(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'imagekit_auth', token }),
    });
  },

    // Upload image

    async upload(file: File): Promise<{ url: string }> {

      const authParams = await this.getAuthParams();

      

          if (!authParams || ('status' in authParams && authParams.status === 'error')) {

      

            throw new Error((authParams as { message?: string })?.message || 'Gagal mendapatkan otentikasi upload. Sesi Anda mungkin telah berakhir, silakan login kembali.');

      

          }

      

      

      

      const formData = new FormData();

      formData.append('file', file);

      formData.append('fileName', file.name);
    // Use key from GAS if available, otherwise fallback to env
    formData.append('publicKey', authParams.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
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
