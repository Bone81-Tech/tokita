// ImageKit configuration for Tokita product showcase
// Replace with your actual ImageKit credentials
if (typeof imagekitConfig === 'undefined') {
    var imagekitConfig = {
        publicKey: 'your_public_key', // Client-side uploads not implemented yet, so this might not be strictly needed for display
        urlEndpoint: 'https://ik.imagekit.io/yzsmfytxo',
        authenticationEndpoint: '/api/auth'
    };
}

// Initialize ImageKit (only if SDK is loaded)
if (typeof ImageKit !== 'undefined' && typeof imagekit === 'undefined') {
    var imagekit = new ImageKit({
        publicKey: imagekitConfig.publicKey,
        urlEndpoint: imagekitConfig.urlEndpoint,
        authenticationEndpoint: imagekitConfig.authenticationEndpoint
    });
}

// Function to get optimized image URL
function getImageUrl(imagePath, options = {}) {
    if (!imagePath) return '';

    // If it's already an imagekit URL, return as is
    if (imagePath.includes('imagekit.io')) {
        // Apply transformations if provided
        if (Object.keys(options).length > 0) {
            let transformedUrl = imagePath;
            const params = [];

            if (options.width) params.push(`w-${options.width}`);
            if (options.height) params.push(`h-${options.height}`);
            if (options.quality) params.push(`q-${options.quality}`);
            if (options.crop) params.push(`c-${options.crop}`);
            if (options.format) params.push(`f-${options.format}`);

            if (params.length > 0) {
                // Check if URL already has transformation parameters
                if (imagePath.includes('?tr=')) {
                    transformedUrl = imagePath.replace('?tr=', `?tr=${params.join(',')},`);
                } else {
                    transformedUrl = `${imagePath}?tr=${params.join(',')}`;
                }
            }

            return transformedUrl;
        }
        return imagePath;
    }

    // If it's a local path, transform it to imagekit URL
    return `${imagekitConfig.urlEndpoint}/${imagePath}`;
}

// Function to get product image with common transformations
function getProductImageUrl(imagePath, width = 400, height = 300) {
    if (!imagePath) return 'https://placehold.co/400x300?text=Image+Not+Found';

    // Add common transformations for product images
    const transformation = `tr=w-${width},h-${height},cm-pad_resize,f-auto,q-80`;

    if (imagePath.includes('?')) {
        return imagePath.includes('?tr=')
            ? `${imagePath},${transformation.replace('tr=', '')}`
            : `${imagePath}&${transformation}`;
    }

    return `${imagePath}?${transformation}`;
}

// Function to preload images for better performance
function preloadImages(imageUrls) {
    if (!imageUrls || !Array.isArray(imageUrls)) return;
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}