// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promo_price?: number;
  category: 'sembako' | 'makanan' | 'minuman' | 'rumahtangga';
  image: string;
  rating?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  products?: Product[];
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  token?: string;
  message?: string;
}

export interface JWTPayload {
  role: string;
  user: string;
  exp: number;
}

// ImageKit types
export interface ImageKitAuthParams {
  signature: string;
  expire: number;
  token: string;
}

export interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  thumbnailUrl?: string;
}
