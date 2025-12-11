// js/admin.js - Rewritten Admin Dashboard for Tokita

document.addEventListener('DOMContentLoaded', function() {
  // Load navigation component
  loadNavigation();

  // 1. Check authentication immediately
  if (!window.tokitaAPI.authAPI.isAuthenticated()) {
    // If not authenticated, redirect to login page. No alerts.
    window.location.href = 'login.html';
    return; // Stop further execution
  }

  // 2. Initial data load
  loadProducts();

  // 3. Set up event listeners
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
});

/**
 * Fetches products from the API and renders them to the list.
 * Uses event delegation for delete buttons.
 */
async function loadProducts() {
  const productListDiv = document.getElementById('product-list');
  if (!productListDiv) return;

  productListDiv.innerHTML = '<div class="text-center py-10 text-gray-500">Memuat produk...</div>';

  try {
    const products = await window.tokitaAPI.productAPI.getAll();
    productListDiv.innerHTML = ''; // Clear loading message

    if (products.length === 0) {
      productListDiv.innerHTML = '<div class="text-center py-10 text-gray-500">Belum ada produk.</div>';
      return;
    }
    
    const productGrid = document.createElement('div');
    productGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

    products.forEach(product => {
      const productCard = createProductCardElement(product);
      productGrid.appendChild(productCard);
    });

    productListDiv.appendChild(productGrid);

    // Use event delegation for delete actions
    productListDiv.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.delete-btn');
      if (deleteButton) {
        const productId = deleteButton.dataset.id;
        if (productId) {
          handleDelete(productId);
        }
      }
    });

  } catch (error) {
    console.error('Error loading products:', error);
    productListDiv.innerHTML = `<div class="text-center py-10 text-red-500">Gagal memuat produk: ${error.message}</div>`;
  }
}

/**
 * Securely creates a product card DOM element instead of an HTML string.
 * @param {object} product - The product data.
 * @returns {HTMLElement} - The product card element.
 */
function createProductCardElement(product) {
    const card = document.createElement('div');
    card.className = 'border rounded-lg p-4 shadow-sm flex flex-col justify-between';

    const price = `Rp ${Number(product.price || 0).toLocaleString('id-ID')}`;
    const promo = product.promo_price ? `Rp ${Number(product.promo_price).toLocaleString('id-ID')}` : null;

    let imageHTML = '';
    if (product.image) {
        imageHTML = `<img src="${product.image}" alt="${product.name}" class="mb-2 w-full h-32 object-cover rounded">`;
    }

    card.innerHTML = `
        <div>
            ${imageHTML}
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-medium text-gray-900">${product.name}</h3>
                    <p class="text-sm text-gray-500">${product.category}</p>
                </div>
                <div class="flex space-x-2">
                    <button data-id="${product.id}" class="edit-btn text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                    <button data-id="${product.id}" class="delete-btn text-red-600 hover:text-red-900 text-sm">Hapus</button>
                </div>
            </div>
            <p class="mt-2 text-sm text-gray-500 line-clamp-2">${product.description || ''}</p>
        </div>
        <div class="mt-2">
            <p class="text-lg font-bold text-indigo-600">${promo || price}</p>
            ${promo ? `<p class="text-sm text-gray-500 line-through">${price}</p>` : ''}
        </div>
    `;
    return card;
}


/**
 * Handles the product form submission with proper UX for loading and feedback.
 */
async function handleProductSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const messageDiv = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');

  // Clear previous message
  messageDiv.textContent = '';
  messageDiv.className = 'hidden';

  // --- Get form data ---
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const promoPrice = document.getElementById('product-promo-price').value ? parseFloat(document.getElementById('product-promo-price').value) : null;
  const category = document.getElementById('product-category').value;
  const imageFile = document.getElementById('product-image').files[0];

  if (!name || !price || !category) {
    showFormMessage('Nama, harga, dan kategori wajib diisi.', 'error');
    return;
  }

  // --- Set loading state ---
  submitButton.disabled = true;
  submitButton.textContent = 'Menyimpan...';

  try {
    let imageUrl = '';
    // 1. Upload image if it exists
    if (imageFile) {
      showFormMessage('Mengupload gambar...', 'info');
      const uploadResult = await window.tokitaAPI.imagekitAPI.upload(imageFile);
      imageUrl = uploadResult.url;
    }

    // 2. Create product object
    const productData = { name, description, price, promo_price: promoPrice, category, image: imageUrl };

    // 3. Submit to API
    showFormMessage('Menyimpan produk...', 'info');
    await window.tokitaAPI.productAPI.create(productData);
    
    // 4. On success
    showFormMessage('Produk berhasil ditambahkan!', 'success');
    form.reset();
    loadProducts(); // Refresh the list

  } catch (error) {
    console.error('Error submitting product:', error);
    showFormMessage(`Gagal: ${error.message}`, 'error');
  } finally {
    // --- Reset button state ---
    submitButton.disabled = false;
    submitButton.textContent = 'Simpan Produk';
  }
}

/**
 * Deletes a product after user confirmation.
 * @param {string} productId - The ID of the product to delete.
 */
async function handleDelete(productId) {
  // A modal would be better than confirm, but this is better than nothing.
  if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini? Ini tidak bisa dibatalkan.')) {
    return;
  }

  try {
    await window.tokitaAPI.productAPI.delete(productId);
    // Success: reload the product list to show the change.
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    // On failure, inform the user non-disruptively.
    // An on-page notification system would be ideal here.
    alert(`Gagal menghapus produk: ${error.message}`);
  }
}


/**
* Displays a message in the form's message div.
* @param {string} message - The message to display.
* @param {'info'|'success'|'error'} type - The type of message.
*/
function showFormMessage(message, type = 'info') {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;

    // Reset classes
    messageDiv.className = 'text-sm p-3 rounded-md'; 

    if (type === 'success') {
        messageDiv.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
        messageDiv.classList.add('bg-red-100', 'text-red-700');
    } else { // 'info'
        messageDiv.classList.add('bg-blue-100', 'text-blue-700');
    }
}
