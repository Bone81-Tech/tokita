// lib/api.ts (Supabase Integration)

import { supabase } from './supabase';
import type { Product, ApiResponse } from '@/types';
import { User } from '@supabase/supabase-js'; // Import User type

// Helper to check if a user is authenticated
async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

// Helper to get authenticated user (if needed for admin checks later)
// This can be used to check user roles if you add them to user_metadata or a profile table
async function getAuthenticatedUser(): Promise<User | null> {
  const { data: { user } = { user: null } } = await supabase.auth.getUser();
  return user;
}


// This file will be refactored to use Supabase client directly
// Product API will interact with Supabase tables
export const productAPI = {
  // Example for getting all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Error fetching products:', error.message);
      throw new Error('Failed to load products');
    }
    return data || [];
  },

  // Example for getting products by category
  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').eq('category', category).order('id', { ascending: true });
    if (error) {
      console.error(`Error fetching products by category ${category}:`, error.message);
      throw new Error('Failed to load products by category');
    }
    return data || [];
  },

  async create(product: Partial<Product>): Promise<ApiResponse> {
    if (!await isAuthenticated()) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }

    const newProduct = {
      ...product,
      id: product.id || 'PRD' + Date.now(), // Generate ID if not provided, consistent with old GAS
    };

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      console.error('Error creating product:', error.message);
      return { status: 'error', message: error.message };
    }
    return { status: 'success', message: 'Product created successfully.' };
  },

  async update(product: Product): Promise<ApiResponse> {
    if (!await isAuthenticated()) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }
    if (!product.id) {
      return { status: 'error', message: 'Product ID is required for update.' };
    }

    const { error } = await supabase.from('products').update(product).eq('id', product.id);
    if (error) {
      console.error(`Error updating product ${product.id}:`, error.message);
      return { status: 'error', message: error.message };
    }
    return { status: 'success', message: 'Product updated successfully.' };
  },

  async delete(id: string): Promise<ApiResponse> {
    if (!await isAuthenticated()) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error(`Error deleting product ${id}:`, error.message);
      return { status: 'error', message: error.message };
    }
    return { status: 'success', message: 'Product deleted successfully.' };
  },
};

// ImageKit API - Now integrated with Next.js API Route for auth
export const imagekitAPI = {
  async getAuthParams(): Promise<{ signature: string; expire: number; token: string; publicKey?: string; } | { status: string; message: string; }> {
    // Get the current session to extract access token
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error('No active session found. Please log in again.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Include the access token
    };

    const response = await fetch('/api/imagekit-auth', {
      method: 'POST',
      headers,
      body: JSON.stringify({}), // No need for credentials since we're using headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ImageKit auth error response:', errorData);
      throw new Error(errorData.message || 'Failed to get ImageKit auth params');
    }

    const result = await response.json();
    console.log('Successfully retrieved ImageKit auth params:', result);
    return result;
  },

  async upload(file: File): Promise<{ url: string }> {
    console.log('Starting image upload for file:', file.name);

    const authParams = await this.getAuthParams();

    if (!authParams || ('status' in authParams && authParams.status === 'error')) {
      console.error('Failed to get auth params for upload:', authParams);
      throw new Error((authParams as { message?: string })?.message || 'Gagal mendapatkan otentikasi upload. Sesi Anda mungkin telah berakhir, silakan login kembali.');
    }

    const successAuthParams = authParams as { signature: string; expire: number; token: string; publicKey?: string; };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', successAuthParams.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
    formData.append('signature', successAuthParams.signature);
    formData.append('expire', successAuthParams.expire.toString());
    formData.append('token', successAuthParams.token);
    formData.append('useUniqueFileName', 'true');
    formData.append('folder', '/tokita_products');

    // Ensure we use the correct ImageKit upload endpoint.
    // This should ideally be a constant from an env var.
    const uploadUrl = process.env.NEXT_PUBLIC_IMAGEKIT_UPLOAD_URL || 'https://upload.imagekit.io/api/v1/files/upload';

    console.log('Sending upload request to ImageKit with params:', {
      fileName: file.name,
      folder: '/tokita_products',
      publicKey: successAuthParams.publicKey
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorResult = await response.text(); // ImageKit might return text instead of JSON on error
      console.error('ImageKit upload failed with response:', errorResult);
      throw new Error(`Upload failed: ${errorResult}`);
    }

    const result = await response.json();
    console.log('Upload response from ImageKit:', result);

    if (!result.url) {
      console.error('No URL returned from ImageKit upload:', result);
      throw new Error(result.message || 'Upload failed - no URL returned');
    }

    return { url: result.url };
  },
};