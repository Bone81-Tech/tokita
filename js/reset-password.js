// js/reset-password.js - Logic for handling password reset using the recommended onAuthStateChange pattern

document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('reset-password-form');
  const messageDiv = document.getElementById('message-div');
  
  if (!resetForm || !messageDiv) {
    console.error('Required form elements not found.');
    return;
  }

  // Check if config is loaded
  if (!window.tokitaConfig || !window.tokitaConfig.supabaseUrl || !window.tokitaConfig.supabaseAnonKey) {
    showMessage('Konfigurasi aplikasi tidak ditemukan. Halaman ini tidak bisa berfungsi.', 'error');
    return;
  }

  // Initialize a Supabase client for this page
  const supabase = window.supabase.createClient(
    window.tokitaConfig.supabaseUrl,
    window.tokitaConfig.supabaseAnonKey
  );

  let isPasswordRecoverySession = false;

  // --- Official Supabase pattern to handle auth events ---
  // This listener waits for the PASSWORD_RECOVERY event which is fired
  // when the user lands on the page from a password reset link.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      isPasswordRecoverySession = true;
      showMessage('Sesi pemulihan password terdeteksi. Silakan masukkan password baru Anda.', 'info');
    }
  });

  // --- Form submission handler ---
  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Ensure this form is only used in a valid password recovery session
    if (!isPasswordRecoverySession) {
      showMessage('Sesi tidak valid. Harap gunakan link dari email reset password Anda.', 'error');
      return;
    }

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    // --- Validation ---
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
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // --- On Success ---
      showMessage('Password berhasil diubah! Anda akan diarahkan ke halaman Login.', 'success');
      resetForm.style.display = 'none';
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);

    } catch (error) {
      console.error('Password reset error:', error);
      showMessage(error.message || 'Gagal mengatur ulang password.', 'error');
      // Re-enable button on failure
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