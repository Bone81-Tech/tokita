// js/reset-password.js - Logic for handling password reset

document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('reset-password-form');
  
  if (!resetForm) {
    console.error('Reset password form not found.');
    return;
  }

  // Check if config is loaded
  if (!window.tokitaConfig || !window.tokitaConfig.supabaseUrl || !window.tokitaConfig.supabaseAnonKey) {
    showMessage('Konfigurasi aplikasi tidak ditemukan. Halaman ini tidak bisa berfungsi.', 'error');
    return;
  }

  // Initialize a separate Supabase client for this specific page
  const supabase = window.supabase.createClient(
    window.tokitaConfig.supabaseUrl,
    window.tokitaConfig.supabaseAnonKey
  );

  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    // --- Basic Validation ---
    if (!newPassword || !confirmPassword) {
      showMessage('Semua kolom wajib diisi.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Password dan konfirmasi password tidak cocok.', 'error');
      return;
    }

    if (newPassword.length < 6) {
        showMessage('Password minimal harus 6 karakter.', 'error');
        return;
    }

    // --- Set loading state ---
    showMessage('Menyimpan password baru...', 'info');
    submitButton.disabled = true;
    submitButton.textContent = 'Memproses...';

    try {
      // --- Call Supabase to update the password ---
      // The Supabase JS library automatically handles the access_token from the URL fragment
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // --- On Success ---
      showMessage('Password berhasil diubah! Anda sekarang bisa login dengan password baru Anda.', 'success');
      // Hide the form and show a link to the login page
      resetForm.style.display = 'none';
      const loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'text-center block text-indigo-600 hover:text-indigo-500';
      loginLink.textContent = 'Pergi ke Halaman Login';
      resetForm.parentElement.appendChild(loginLink);

    } catch (error) {
      console.error('Password reset error:', error);
      showMessage(error.message || 'Gagal mengatur ulang password.', 'error');
    } finally {
      // --- Reset button state ---
      submitButton.disabled = false;
      submitButton.textContent = 'Simpan Password Baru';
    }
  });
});

/**
 * Displays a message in the message div.
 * @param {string} message - The message to display.
 * @param {'info'|'success'|'error'} type - The type of message.
 */
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message-div');
  if (!messageDiv) return;

  messageDiv.textContent = message;
  // Reset classes and apply new ones
  messageDiv.className = 'text-sm text-center p-3 rounded-md';

  if (type === 'success') {
    messageDiv.classList.add('bg-green-100', 'text-green-700');
  } else if (type === 'error') {
    messageDiv.classList.add('bg-red-100', 'text-red-700');
  } else { // 'info'
    messageDiv.classList.add('bg-blue-100', 'text-blue-700');
  }
}
