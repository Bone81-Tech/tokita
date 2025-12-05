// Global store for site content
window.siteContent = {
    products: [],
    categories: [],
    promos: [],
    testimonials: [],
    faqs: [],
    profile: []
};

// Function to fetch all site content from GAS API
async function fetchSiteContent() {
    try {
        const response = await fetch(config.apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Filter and sanitize data
        // Removing rows where 'id' is empty or contains instruction text
        window.siteContent.products = (data.products || []).filter(p => 
            p.id && 
            !String(p.id).toLowerCase().includes('kolom') && 
            !String(p.name).includes('Nama Produk')
        );
        
        window.siteContent.categories = data.categories || [];
        window.siteContent.promos = data.promos || [];
        window.siteContent.testimonials = data.testimonials || [];
        window.siteContent.faqs = data.faqs || [];
        window.siteContent.profile = data.profile || [];

        console.log('Site content loaded:', window.siteContent);
        
        // Dispatch event when data is ready
        document.dispatchEvent(new CustomEvent('site-content-loaded'));

    } catch (error) {
        console.error('Error fetching site content:', error);
        // Fallback or error notification could go here
    }
}

// Initialize fetch on load
document.addEventListener('DOMContentLoaded', fetchSiteContent);

// HTMX Request Handling
// API endpoint for product filtering
document.addEventListener('htmx:beforeSend', function(evt) {
    if (evt.detail.path === '/api/products/filter') {
        evt.preventDefault();

        // Get category from button click or default to 'all'
        const category = evt.detail.parameters.category || 'all';
        
        // Use the global window.siteContent.products
        // Note: products.js functions need to be updated to accept data or use this global
        const products = getProductsByCategory(category, 1, 6);
        const html = renderProductCards(products);

        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = html;
        }
        
        // Stop HTMX from actually sending the request
        evt.detail.xhr.abort(); 
    }
});

// API endpoint for loading more products
document.addEventListener('htmx:beforeSend', function(evt) {
    if (evt.detail.path === '/api/products') {
        evt.preventDefault();

        // Simulate small delay for UX
        setTimeout(() => {
            const page = parseInt(evt.detail.parameters.page) || 1; // You might need to track current page globally
            // Logic for pagination needs state tracking (current page)
            // For now, let's just load next batch from global
            // Note: This needs better state management in products.js
            
            // Temporary fix: get next 6 items (assuming page 2 for now)
            // Ideally currentCategory and currentPage should be tracked in products.js
            const limit = 6;
            // Accessing global variables from products.js (bad practice but works for now)
            // We really should move state to a centralized place or Alpine store
            
            // We will let products.js handle the logic if we export/expose state there
            // or we just call a function from there.
            
            // Let's assume getNextPageProducts() exists in products.js
            if (typeof getNextPageProducts === 'function') {
                const products = getNextPageProducts();
                const html = renderProductCards(products);
                
                const productGrid = document.getElementById('product-grid');
                productGrid.insertAdjacentHTML('beforeend', html);
            }
        }, 300);
        
         evt.detail.xhr.abort();
    }
});

// API endpoint for adding to cart
document.addEventListener('htmx:beforeSend', function(evt) {
    if (evt.detail.path === '/api/cart/add') {
        evt.preventDefault();
        
        const productId = evt.detail.parameters.productId;
        console.log('Adding product to cart:', productId);
        
        // Find product details
        const product = window.siteContent.products.find(p => p.id == productId);
        
        // Show a notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-500';
        notification.textContent = product ? `Ditambahkan: ${product.name}` : 'Produk ditambahkan ke keranjang!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
        
        evt.detail.xhr.abort();
    }
});