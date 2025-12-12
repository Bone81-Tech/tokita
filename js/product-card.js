// js/product-card.js - Product Card Component for Tokita

// Helper function to sanitize output for display
function sanitizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Function to create product card element using DOM methods for better security
function createProductCardElement(product) {
  // Sanitize product data
  const sanitizedName = sanitizeOutput(product.name || 'Nama Produk');
  const sanitizedDescription = sanitizeOutput(product.description || '');
  const sanitizedImage = product.image ? sanitizeUrlForDisplay(product.image) : 'https://placehold.co/400x300?text=No+Image';
  const sanitizedRating = product.rating ? parseFloat(product.rating) : null;

  // Format price
  const displayPrice = typeof product.price === 'number'
    ? `Rp ${product.price.toLocaleString('id-ID')}`
    : sanitizeOutput(String(product.price || 0));

  const promoPrice = product.promo_price
    ? typeof product.promo_price === 'number'
      ? `Rp ${product.promo_price.toLocaleString('id-ID')}`
      : sanitizeOutput(String(product.promo_price || ''))
    : null;

  // Add cache-busting to image URL to ensure updated images appear
  const imageUrl = sanitizedImage
    ? `${sanitizedImage}${sanitizedImage.includes('?') ? '&' : '?'}cb=${Date.now()}`
    : 'https://placehold.co/400x300?text=No+Image';

  // Create the product card element
  const productCard = document.createElement('div');
  productCard.className = 'product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';

  // Create all elements using DOM methods to prevent XSS
  const relativeDiv = document.createElement('div');
  relativeDiv.className = 'relative';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = sanitizedName;
  img.className = 'w-full h-48 object-contain';
  img.loading = 'lazy';

  // Add error handling for image
  img.onerror = function() {
    this.onerror = null;
    this.src = 'https://placehold.co/400x300?text=Produk+Tokita';
  };

  relativeDiv.appendChild(img);

  // Add rating badge if exists
  if (sanitizedRating) {
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold text-indigo-600';
    ratingDiv.textContent = `${sanitizedRating} ★`;
    relativeDiv.appendChild(ratingDiv);
  }

  // Add promo badge if exists
  if (promoPrice) {
    const promoDiv = document.createElement('div');
    promoDiv.className = 'absolute top-2 left-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold';
    promoDiv.textContent = 'PROMO';
    relativeDiv.appendChild(promoDiv);
  }

  productCard.appendChild(relativeDiv);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'p-5';

  const flexDiv = document.createElement('div');
  flexDiv.className = 'flex flex-col h-full justify-between';

  // Product info
  const infoDiv = document.createElement('div');

  const titleH3 = document.createElement('h3');
  titleH3.className = 'text-lg font-semibold text-gray-900 line-clamp-2';
  titleH3.textContent = sanitizedName;

  const descP = document.createElement('p');
  descP.className = 'mt-1 text-gray-600 text-sm line-clamp-2';
  descP.textContent = sanitizedDescription;

  infoDiv.appendChild(titleH3);
  infoDiv.appendChild(descP);

  // Price and button section
  const priceButtonDiv = document.createElement('div');
  priceButtonDiv.className = 'mt-4 flex items-center justify-between';

  const priceColDiv = document.createElement('div');
  priceColDiv.className = 'flex flex-col';

  if (promoPrice) {
    const originalPriceSpan = document.createElement('span');
    originalPriceSpan.className = 'text-xs text-gray-400 line-through';
    originalPriceSpan.textContent = displayPrice;
    priceColDiv.appendChild(originalPriceSpan);
  }

  const finalPriceSpan = document.createElement('span');
  finalPriceSpan.className = 'text-lg font-bold text-indigo-600';
  finalPriceSpan.textContent = promoPrice || displayPrice;
  priceColDiv.appendChild(finalPriceSpan);

  priceButtonDiv.appendChild(priceColDiv);
  flexDiv.appendChild(infoDiv);
  flexDiv.appendChild(priceButtonDiv);
  contentDiv.appendChild(flexDiv);
  productCard.appendChild(contentDiv);

  return productCard;
}

// Helper function to sanitize URL for display
function sanitizeUrlForDisplay(url) {
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

// Function to add product to cart
function addToCart(productId) {
  // Get current cart from localStorage or initialize
  let cart = JSON.parse(localStorage.getItem('tokita-cart')) || [];

  // Check if product is already in cart
  const existingItemIndex = cart.findIndex(item => item.id === productId);

  if (existingItemIndex > -1) {
    // If exists, increment quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // If not exists, add to cart with quantity 1
    // For this, we need to find the product details
    // This would normally be done by looking up the product in the current view
    // For now, we'll just add the ID and fetch details later if needed
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  // Save updated cart to localStorage
  localStorage.setItem('tokita-cart', JSON.stringify(cart));

  // Show confirmation message
  alert('Produk berhasil ditambahkan ke keranjang!');

  // Optional: Update cart counter in UI
  updateCartCount();
}

// Function to update cart count display
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('tokita-cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Update cart count elements if they exist
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
  });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
});