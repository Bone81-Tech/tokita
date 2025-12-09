// js/product-grid.js - Product Grid Component for Tokita

// Define categories
const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'sembako', label: 'Sembako' },
  { id: 'makanan', label: 'Makanan Instan' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'rumahtangga', label: 'Rumah Tangga' },
];

// Product grid component with better error handling
function loadProductGrid() {
  try {
    const productGridPlaceholder = document.getElementById('product-grid-placeholder');

    if (!productGridPlaceholder) {
      console.error('Product grid placeholder element not found');
      return;
    }

    productGridPlaceholder.innerHTML = `
      <section id="products" class="product-grid-container">
        <div class="container">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Katalog Produk
            </h2>
            <div class="w-20 h-1 bg-indigo-600 mx-auto rounded-full mb-4"></div>

            <!-- Product Categories -->
            <div class="mt-8 flex flex-wrap justify-center gap-2">
              ${CATEGORIES.map((category) => `
                <button
                  data-category="${category.id}"
                  class="category-button ${category.id === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}"
                >
                  ${category.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Product Grid -->
          <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-x-hidden">
            <!-- Products will be loaded here -->
          </div>

          <!-- Loading indicator -->
          <div id="loading-indicator" class="hidden col-span-full text-center py-20">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-500">Memuat produk...</p>
          </div>

          <!-- Error message -->
          <div id="error-message" class="hidden col-span-full text-center py-10 text-red-500">
            Gagal memuat produk. Silakan coba lagi nanti.
          </div>

          <!-- No products message -->
          <div id="no-products-message" class="hidden col-span-full text-center py-10 text-gray-500">
            Belum ada produk untuk kategori ini.
          </div>
        </div>
      </section>
    `;

    // Initialize product grid
    initializeProductGrid();
  } catch (error) {
    console.error('Error in loadProductGrid:', error);
    const productGridPlaceholder = document.getElementById('product-grid-placeholder');
    if (productGridPlaceholder) {
      productGridPlaceholder.innerHTML = '<div class="text-center py-10 text-red-500">Terjadi kesalahan dalam memuat katalog produk.</div>';
    }
  }
}

async function initializeProductGrid() {
  const categoryButtons = document.querySelectorAll('[data-category]');
  const productGrid = document.getElementById('product-grid');
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorMessage = document.getElementById('error-message');
  const noProductsMessage = document.getElementById('no-products-message');
  
  let selectedCategory = 'all';
  
  // Fetch and display products on initial load
  await fetchAndDisplayProducts(selectedCategory);
  
  // Add event listeners to category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', async function() {
      // Update selected category
      selectedCategory = this.getAttribute('data-category');
      
      // Update active button
      categoryButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === selectedCategory) {
          btn.classList.add('bg-indigo-600', 'text-white', 'shadow-lg');
          btn.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200', 'hover:bg-gray-50');
        } else {
          btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg');
          btn.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200', 'hover:bg-gray-50');
        }
      });
      
      // Fetch products for the selected category
      await fetchAndDisplayProducts(selectedCategory);
    });
  });
}

async function fetchAndDisplayProducts(category) {
  const productGrid = document.getElementById('product-grid');
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorMessage = document.getElementById('error-message');
  const noProductsMessage = document.getElementById('no-products-message');
  
  // Show loading, hide other messages
  loadingIndicator.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  noProductsMessage.classList.add('hidden');
  productGrid.innerHTML = '';
  
  try {
    let products = [];

    if (category === 'all') {
      products = await window.tokitaAPI.productAPI.getAll();
    } else {
      products = await window.tokitaAPI.productAPI.getByCategory(category);
    }

    // Hide loading indicator
    loadingIndicator.classList.add('hidden');

    if (products.length === 0) {
      // Show no products message
      noProductsMessage.classList.remove('hidden');
    } else {
      // Clear product grid and add products with optimized rendering
      productGrid.innerHTML = ''; // Clear previous content

      // Use DocumentFragment for better performance when adding multiple elements
      const fragment = document.createDocumentFragment();

      for (const product of products) {
        const productCard = createProductCard(product);
        fragment.appendChild(productCard);
      }

      productGrid.appendChild(fragment);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    loadingIndicator.classList.add('hidden');
    errorMessage.classList.remove('hidden');
  }
}

// Function to create product card element (will be implemented in product-card.js)
function createProductCard(product) {
  try {
    if (typeof createProductCardElement === 'function') {
      return createProductCardElement(product);
    } else {
      // Fallback for when product-card.js hasn't loaded yet
      const div = document.createElement('div');
      div.textContent = `Product: ${sanitizeOutput(product.name) || 'Loading...'}`;
      return div;
    }
  } catch (error) {
    console.error('Error in createProductCard:', error);
    const div = document.createElement('div');
    div.textContent = 'Gagal memuat produk.';
    return div;
  }
}

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