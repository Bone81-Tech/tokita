// ImageKit configuration
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/yzsmfytxo',
};

// Get optimized image URL with transformations
export function getImageUrl(imagePath: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  crop?: string;
  format?: string;
} = {}): string {
  if (!imagePath) return '';

  // If it's already an imagekit URL, apply transformations
  if (imagePath.includes('imagekit.io')) {
    const params: string[] = [];

    if (options.width) params.push(`w-${options.width}`);
    if (options.height) params.push(`h-${options.height}`);
    if (options.quality) params.push(`q-${options.quality}`);
    if (options.crop) params.push(`c-${options.crop}`);
    if (options.format) params.push(`f-${options.format}`);

    if (params.length > 0) {
      const transformation = `tr=${params.join(',')}`;
      if (imagePath.includes('?tr=')) {
        return imagePath.replace('?tr=', `?tr=${params.join(',')},`);
      } else {
        return `${imagePath}?${transformation}`;
      }
    }

    return imagePath;
  }

  // If it's a local path, transform it to imagekit URL
  return `${imagekitConfig.urlEndpoint}/${imagePath}`;
}

// Get product image with common transformations
export function getProductImageUrl(imagePath: string, width = 400, height = 300): string {
  if (!imagePath) return 'https://placehold.co/400x300?text=Image+Not+Found';

  return getImageUrl(imagePath, {
    width,
    height,
    quality: 80,
    format: 'auto',
  });
}
