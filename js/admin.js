// js/admin.js - Admin Dashboard for Tokita

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is authenticated
  const isAuthenticated = await window.tokitaAPI.authAPI.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page or show error
    alert('Anda harus login terlebih dahulu');
    // In a real implementation, you might redirect to a login page
    // window.location.href = 'login.html';
    return;
  }
  
  // Load products
  loadProducts();
  
  // Set up form submission
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
  
  // Set up logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

// Load products and display them
async function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  
  try {
    const products = await window.tokitaAPI.productAPI.getAll();
    
    if (products.length === 0) {
      productList.innerHTML = '<div class="text-center py-10 text-gray-500">Belum ada produk</div>';
      return;
    }
    
    // Create HTML for product list
    const productsHTML = products.map(product => createProductCardHTML(product)).join('');
    productList.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${productsHTML}
      </div>
    `;
    
    // Add event listeners to edit and delete buttons
    products.forEach(product => {
      const editBtn = document.getElementById(`edit-btn-${product.id}`);
      if (editBtn) {
        editBtn.addEventListener('click', () => editProduct(product));
      }
      
      const deleteBtn = document.getElementById(`delete-btn-${product.id}`);
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));
      }
    });
  } catch (error) {
    console.error('Error loading products:', error);
    productList.innerHTML = '<div class="text-center py-10 text-red-500">Gagal memuat produk</div>';
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

// Create HTML for a product card using DOM methods for better security
function createProductCardHTML(product) {
  // Sanitize product data
  const sanitizedName = sanitizeOutput(product.name || 'Nama Produk');
  const sanitizedCategory = sanitizeOutput(product.category || '');
  const sanitizedDescription = sanitizeOutput(product.description || '');
  const sanitizedImage = product.image ? sanitizeUrlForDisplay(product.image) : '';

  const displayPrice = typeof product.price === 'number'
    ? `Rp ${product.price.toLocaleString('id-ID')}`
    : sanitizeOutput(String(product.price || 0));

  const promoPrice = product.promo_price
    ? typeof product.promo_price === 'number'
      ? `Rp ${product.promo_price.toLocaleString('id-ID')}`
      : sanitizeOutput(String(product.promo_price))
    : null;

  // Create elements using DOM methods to prevent XSS
  const cardDiv = document.createElement('div');
  cardDiv.className = 'border rounded-lg p-4 shadow-sm';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex justify-between items-start';

  // Left side - product info
  const infoDiv = document.createElement('div');

  const nameH3 = document.createElement('h3');
  nameH3.className = 'font-medium text-gray-900';
  nameH3.textContent = sanitizedName;

  const categoryP = document.createElement('p');
  categoryP.className = 'text-sm text-gray-500';
  categoryP.textContent = sanitizedCategory;

  const priceDiv = document.createElement('div');
  priceDiv.className = 'mt-2';

  const priceP = document.createElement('p');
  priceP.className = 'text-lg font-bold text-indigo-600';
  priceP.textContent = promoPrice || displayPrice;

  priceDiv.appendChild(priceP);

  if (promoPrice) {
    const originalPriceP = document.createElement('p');
    originalPriceP.className = 'text-sm text-gray-500 line-through';
    originalPriceP.textContent = displayPrice;
    priceDiv.appendChild(originalPriceP);
  }

  infoDiv.appendChild(nameH3);
  infoDiv.appendChild(categoryP);
  infoDiv.appendChild(priceDiv);

  // Right side - action buttons
  const actionDiv = document.createElement('div');
  actionDiv.className = 'flex space-x-2';

  const editBtn = document.createElement('button');
  editBtn.id = `edit-btn-${product.id}`;
  editBtn.className = 'text-indigo-600 hover:text-indigo-900 text-sm';
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => editProduct(product);

  const deleteBtn = document.createElement('button');
  deleteBtn.id = `delete-btn-${product.id}`;
  deleteBtn.className = 'text-red-600 hover:text-red-900 text-sm';
  deleteBtn.textContent = 'Hapus';
  deleteBtn.onclick = () => deleteProduct(product.id);

  actionDiv.appendChild(editBtn);
  actionDiv.appendChild(deleteBtn);

  // Description
  const descP = document.createElement('p');
  descP.className = 'mt-2 text-sm text-gray-500 line-clamp-2';
  descP.textContent = sanitizedDescription;

  // Image if exists
  if (sanitizedImage) {
    const img = document.createElement('img');
    img.src = sanitizedImage;
    img.alt = sanitizedName;
    img.className = 'mt-2 w-full h-32 object-cover rounded';
    cardDiv.appendChild(img);
  }

  contentDiv.appendChild(infoDiv);
  contentDiv.appendChild(actionDiv);

  cardDiv.appendChild(contentDiv);
  cardDiv.appendChild(descP);

  return cardDiv.outerHTML;
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

// Handle form submission
async function handleProductSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const promoPrice = document.getElementById('product-promo-price').value ? parseFloat(document.getElementById('product-promo-price').value) : null;
  const category = document.getElementById('product-category').value;
  const imageFile = document.getElementById('product-image').files[0];
  
  if (!name || !price || !category) {
    alert('Nama, harga, dan kategori wajib diisi');
    return;
  }
  
  let imageUrl = '';
  if (imageFile) {
    try {
      // Upload image to ImageKit
      const uploadResult = await window.tokitaAPI.imagekitAPI.upload(imageFile);
      imageUrl = uploadResult.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar: ' + error.message);
      return;
    }
  }
  
  // Create product object
  const product = {
    name,
    description,
    price,
    promo_price: promoPrice,
    category,
    image: imageUrl
  };
  
  try {
    // Submit to API
    const result = await window.tokitaAPI.productAPI.create(product);
    
    if (result.status === 'success') {
      alert('Produk berhasil ditambahkan');
      // Reset form
      document.getElementById('product-form').reset();
      // Reload products
      loadProducts();
    } else {
      alert('Gagal menambahkan produk: ' + result.message);
    }
  } catch (error) {
    console.error('Error creating product:', error);
    alert('Gagal menambahkan produk: ' + error.message);
  }
}

// Edit product (populate form with product data)
function editProduct(product) {
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-promo-price').value = product.promo_price || '';
  document.getElementById('product-category').value = product.category || 'sembako';
  
  // For editing, we'll need to handle this differently
  // This is a simplified implementation
  alert('Fitur edit akan diimplementasikan segera');
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
    return;
  }
  
  try {
    const result = await window.tokitaAPI.productAPI.delete(productId);
    
    if (result.status === 'success') {
      alert('Produk berhasil dihapus');
      // Reload products
      loadProducts();
    } else {
      alert('Gagal menghapus produk: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Gagal menghapus produk: ' + error.message);
  }
}

// Handle logout
async function handleLogout() {
  if (!confirm('Apakah Anda yakin ingin logout?')) {
    return;
  }
  
  try {
    const result = await window.tokitaAPI.authAPI.logout();
    
    if (result.status === 'success') {
      // In a real implementation, you might redirect to login page
      // window.location.href = 'login.html';
      alert('Berhasil logout');
    } else {
      alert('Gagal logout: ' + result.message);
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Gagal logout: ' + error.message);
  }
}