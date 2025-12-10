// js/reset-password.js - Logic for handling password reset
// Final, robust version using a combination of URL hash checking and onAuthStateChange
// to overcome known race conditions with the PASSWORD_RECOVERY event.

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

  // --- Robust Session Handling ---
  // Check the URL hash immediately on page load for the recovery type.
  // This helps prevent race conditions where onAuthStateChange might clear the hash
  // before we can inspect it.
  const isRecoveryFlow = window.location.hash.includes('type=recovery');
  let hasHandledRecovery = false;

  if (isRecoveryFlow) {
    showMessage('Sesi pemulihan password terdeteksi. Silakan masukkan password baru Anda.', 'info');
  } else {
    showMessage('Link tidak valid atau sudah kedaluwarsa. Harap minta link reset password yang baru.', 'error');
    resetForm.style.display = 'none'; // Hide form if not a recovery flow
  }
  
  // onAuthStateChange is still useful to confirm the session is ready.
  supabase.auth.onAuthStateChange(async (event, session) => {
    // Log all events for debugging, as requested previously.
    console.log('Supabase auth event:', event, session);

    // We are now primarily relying on the hash check, but we can confirm with this event.
    // The main purpose of this listener now is to let us know the Supabase client is ready.
    if (event === "SIGNED_IN" && isRecoveryFlow && !hasHandledRecovery) {
        console.log("Password recovery session confirmed via SIGNED_IN event.");
        hasHandledRecovery = true; // Ensure we only log this once
    } else if (event === "PASSWORD_RECOVERY") {
        // This is the ideal event, but we have a fallback for when it doesn't fire.
        console.log("Password recovery session confirmed via PASSWORD_RECOVERY event.");
        hasHandledRecovery = true;
    }
  });


  // --- Form submission handler ---
  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // The primary gate is now the initial hash check.
    if (!isRecoveryFlow) {
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
