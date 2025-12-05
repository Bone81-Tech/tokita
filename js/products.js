// Products Logic relying on window.siteContent (populated by api.js)

// State for pagination and filtering
let currentPage = 1;
let currentCategory = 'all';
const ITEMS_PER_PAGE = 8;

// Helper to get active products from global store
function getAllProducts() {
    return window.siteContent ? window.siteContent.products : [];
}

// Function to get products by category with pagination
function getProductsByCategory(category = 'all', page = 1, limit = ITEMS_PER_PAGE) {
    currentCategory = category;
    currentPage = page; // Reset or set current page
    
    const allProducts = getAllProducts();
    const filteredProducts = category === 'all'
        ? allProducts
        : allProducts.filter(product => product.category && product.category.toLowerCase() === category.toLowerCase());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Check if we reached the end
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        if (endIndex >= filteredProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }

    return filteredProducts.slice(startIndex, endIndex);
}

// Function called by api.js to load next page
function getNextPageProducts() {
    currentPage++;
    return getProductsByCategory(currentCategory, currentPage, ITEMS_PER_PAGE);
}

// Function to render product cards
function renderProductCards(products) {
    if (!products || products.length === 0) {
        return '<div class="col-span-full text-center py-10 text-gray-500">Belum ada produk untuk kategori ini.</div>';
    }

    return products.map(product => {
        // Handle potentially missing fields gracefully
        const imageUrl = product.image || 'https://placehold.co/400x300?text=No+Image';
        // Optimize if it's an ImageKit URL, otherwise use as is
        const optimizedImageUrl = getProductImageUrl(imageUrl, 400, 300);
        
        // Format price if it's just a number
        let displayPrice = product.price;
        if (typeof product.price === 'number') {
            displayPrice = 'Rp ' + product.price.toLocaleString('id-ID');
        }

        return `
        <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative">
                <img
                    src="${optimizedImageUrl}"
                    alt="${product.name}"
                    class="w-full h-48 object-cover"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=Produk+Tokita';"
                >
                ${product.rating ? `
                <div class="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold text-indigo-600">
                    ${product.rating} ★
                </div>` : ''}
                ${product.promo_price ? `
                <div class="absolute top-2 left-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                    PROMO
                </div>` : ''}
            </div>
            <div class="p-5">
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.name}</h3>
                        <p class="mt-1 text-gray-600 text-sm line-clamp-2">${product.description || ''}</p>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                        <div class="flex flex-col">
                            ${product.promo_price ? `<span class="text-xs text-gray-400 line-through">${displayPrice}</span>` : ''}
                            <span class="text-lg font-bold text-indigo-600">
                                ${product.promo_price ? (typeof product.promo_price === 'number' ? 'Rp ' + product.promo_price.toLocaleString('id-ID') : product.promo_price) : displayPrice}
                            </span>
                        </div>
                         <button
                            class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            hx-post="/api/cart/add"
                            hx-vals='js:{productId: "${product.id}"}'
                            aria-label="Add to cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005.92 1H3z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Initial render listener
document.addEventListener('site-content-loaded', function() {
    console.log('Rendering initial products from loaded data...');
    // Initial Render
    const products = getProductsByCategory('all', 1, ITEMS_PER_PAGE);
    const html = renderProductCards(products);

    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.innerHTML = html;
    }
});

// Fallback if DOM loaded but data not yet (handled by api.js calling fetch on DOMContentLoaded)
// Only needed if we wanted to show skeletons while loading
document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.innerHTML = '<div class="col-span-full text-center py-20"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div><p class="mt-2 text-gray-500">Memuat produk...</p></div>';
    }
});