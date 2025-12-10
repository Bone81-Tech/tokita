// js/reset-password.js - Logic for handling password reset
// Final, robust version using a combination of URL hash checking and onAuthStateChange
// to overcome known race conditions with the PASSWORD_RECOVERY event.

document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('reset-password-form');
    const messageDiv = document.getElementById('message-div');
    
    // 1. Pengecekan Awal Elemen
    if (!resetForm || !messageDiv) {
        console.error('Required form elements not found.');
        return;
    }

    // 2. Pengecekan Konfigurasi
    if (!window.tokitaConfig || !window.tokitaConfig.supabaseUrl || !window.tokitaConfig.supabaseAnonKey) {
        showMessage('Konfigurasi aplikasi tidak ditemukan. Halaman ini tidak bisa berfungsi.', 'error');
        return;
    }

    // 3. Inisialisasi Supabase
    const supabase = window.supabase.createClient(
        window.tokitaConfig.supabaseUrl,
        window.tokitaConfig.supabaseAnonKey
    );

    // --- Robust Session Handling ---
    // Cek URL hash segera untuk tipe recovery (mengatasi race condition)
    const isRecoveryFlow = window.location.hash.includes('type=recovery');
    let hasHandledRecovery = false;

    if (isRecoveryFlow) {
        showMessage('Sesi pemulihan password terdeteksi. Silakan masukkan password baru Anda.', 'info');
        resetForm.style.display = 'block'; // Pastikan form terlihat
    } else {
        // Hanya tampilkan error jika tidak ada hash recovery (link tidak valid atau sudah kedaluwarsa)
        showMessage('Link tidak valid atau sudah kedaluwarsa. Harap minta link reset password yang baru.', 'error');
        resetForm.style.display = 'none'; // Sembunyikan form jika bukan alur recovery
    }
    
    // onAuthStateChange digunakan untuk konfirmasi dan logging
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase auth event:', event, session);

        if (event === "SIGNED_IN" && isRecoveryFlow && !hasHandledRecovery) {
            console.log("Password recovery session confirmed via SIGNED_IN event.");
            hasHandledRecovery = true; 
        } else if (event === "PASSWORD_RECOVERY") {
            // Event ideal yang mungkin tidak selalu terpicu
            console.log("Password recovery session confirmed via PASSWORD_RECOVERY event.");
            hasHandledRecovery = true;
        }
    });


    // --- Form submission handler ---
    resetForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Gate: Pastikan ini adalah sesi recovery yang valid
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
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            // --- On Success ---
            showMessage('Password berhasil diubah! Anda akan diarahkan ke halaman Login.', 'success');
            resetForm.style.display = 'none';
            
            // PENINGKATAN: Bersihkan URL hash untuk keamanan dan UX yang lebih baik
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect ke halaman login setelah jeda
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);
            
            let displayMessage = 'Gagal mengatur ulang password.';
            if (error.message.includes('Invalid Grant')) {
                displayMessage = 'Link pemulihan password sudah kedaluwarsa atau tidak valid. Silakan minta link baru.';
            } else {
                displayMessage = error.message || displayMessage;
            }
            
            showMessage(displayMessage, 'error');
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