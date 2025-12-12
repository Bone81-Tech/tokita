// js/admin.js - Rewritten Admin Dashboard for Tokita

document.addEventListener('DOMContentLoaded', function() {
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
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
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
      const editButton = event.target.closest('.edit-btn');

      if (deleteButton) {
        const productId = deleteButton.dataset.id;
        if (productId) {
          handleDelete(productId);
        }
      } else if (editButton) {
        const productId = editButton.dataset.id;
        if (productId) {
          handleEdit(productId);
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
 * Fetches a product's data and populates the form for editing.
 * @param {string} productId - The ID of the product to edit.
 */
async function handleEdit(productId) {
    try {
        const product = await window.tokitaAPI.productAPI.getById(productId);
        if (product) {
            populateFormForEdit(product);
        } else {
            alert('Produk tidak ditemukan.');
        }
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        alert(`Gagal memuat detail produk: ${error.message}`);
    }
}

/**
 * Fills the product form with data for editing.
 * @param {object} product - The product data to populate the form with.
 */
function populateFormForEdit(product) {
    const form = document.getElementById('product-form');
    // Clear any existing hidden ID
    const existingIdInput = form.querySelector('#product-id');
    if (existingIdInput) {
        existingIdInput.remove();
    }

    // Set form values
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price || 0;
    document.getElementById('product-promo-price').value = product.promo_price || '';
    document.getElementById('product-category').value = product.category || 'sembako';
    
    // Create and append hidden input for the product ID
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'product-id';
    idInput.value = product.id;
    form.appendChild(idInput);

    // Change UI to "Edit Mode"
    form.parentElement.querySelector('h2').textContent = 'Edit Produk';
    form.querySelector('button[type="submit"]').textContent = 'Update Produk';

    // Scroll to form and focus
    form.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('product-name').focus();
}



/**
 * Handles the product form submission for both creating and updating products.
 */
async function handleProductSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const messageDiv = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const idInput = form.querySelector('#product-id');
  const isEditMode = !!idInput;

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
    // 1. Fetch existing product data if in edit mode, to get the old image URL
    let productData = {};
    if (isEditMode) {
      const existingProduct = await window.tokitaAPI.productAPI.getById(idInput.value);
      productData.image = existingProduct.image; // Start with the old image
    }

    // 2. Upload a new image if one is provided
    if (imageFile) {
      showFormMessage('Mengupload gambar baru...', 'info');
      const uploadResult = await window.tokitaAPI.imagekitAPI.upload(imageFile);
      productData.image = uploadResult.url; // Overwrite with new image URL
    }

    // 3. Populate the rest of the product data
    productData = { ...productData, name, description, price, promo_price: promoPrice, category };
    
    // 4. Submit to API (Create or Update)
    if (isEditMode) {
      productData.id = idInput.value;
      showFormMessage('Mengupdate produk...', 'info');
      await window.tokitaAPI.productAPI.update(productData);
      showFormMessage('Produk berhasil diupdate!', 'success');
    } else {
      showFormMessage('Menyimpan produk baru...', 'info');
      await window.tokitaAPI.productAPI.create(productData);
      showFormMessage('Produk berhasil ditambahkan!', 'success');
    }
    
    // 5. On success, reset the form and UI
    resetFormToCreateMode();
    loadProducts(); // Refresh the list

  } catch (error) {
    console.error('Error submitting product:', error);
    showFormMessage(`Gagal: ${error.message}`, 'error');
  } finally {
    // --- Reset button state ---
    submitButton.disabled = false;
    // The button text is reset in resetFormToCreateMode, but we do it here too just in case
    submitButton.textContent = isEditMode ? 'Update Produk' : 'Simpan Produk'; 
  }
}

/**
 * Resets the product form back to its original "Create" state.
 */
function resetFormToCreateMode() {
    const form = document.getElementById('product-form');
    form.reset();

    // Remove the hidden ID input
    const idInput = form.querySelector('#product-id');
    if (idInput) {
        idInput.remove();
    }

    // Reset UI text
    form.parentElement.querySelector('h2').textContent = 'Tambah Produk Baru';
    form.querySelector('button[type="submit"]').textContent = 'Simpan Produk';

    // Hide any lingering form messages
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = '';
    messageDiv.className = 'hidden';
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
 * Logs the user out and redirects to the home page.
 */
async function handleLogout() {
    try {
        await window.tokitaAPI.authAPI.logout();
        // On successful logout, redirect to the home page.
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        alert(`Gagal logout: ${error.message}`);
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
