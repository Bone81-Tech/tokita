// 2. PERUBAHAN KRITIS: Menggunakan objek global 'supabase'
const supabase = supabase.createClient(window.tokitaConfig.supabaseUrl, window.tokitaConfig.supabaseAnonKey)

document.addEventListener('DOMContentLoaded', function () {
    const newPasswordInput = document.getElementById('new-password');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message-div'); // Changed from 'message' to 'message-div'

    // 1. DENGARKAN EVENT AUTH
    // Saat halaman dimuat, Supabase akan otomatis memakan token URL
    // dan memicu event 'PASSWORD_RECOVERY'.
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Status Auth Berubah:", event);

        if (event === "PASSWORD_RECOVERY") {
            // Ini adalah tanda bahwa link email valid!
            // User sekarang dalam keadaan "Login Sementara".
            messageDiv.innerHTML = "<span style='color:green'>Verifikasi berhasil. Silakan masukkan password baru.</span>";
            submitBtn.disabled = false;
        } else if (event === "SIGNED_OUT") {
            // Jika user tidak login, mungkin token sudah kadaluarsa sebelum halaman dimuat
             messageDiv.innerHTML = "<span style='color:red'>Link tidak valid atau kadaluarsa.</span>";
        }
    });

    // 2. FUNGSI GANTI PASSWORD
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const newPassword = newPasswordInput.value;

        if (!newPassword) {
            alert("Password tidak boleh kosong!");
            return;
        }
        
        if (newPassword.length < 6) { // Added password length validation
            alert("Password minimal harus 6 karakter.");
            return;
        }


        messageDiv.innerText = "Sedang memperbarui password...";

        // KUNCI UTAMA: Kita menggunakan 'updateUser', BUKAN memverifikasi token lagi.
        // Kita mengandalkan sesi yang sudah terbentuk di langkah 1.
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error("Error:", error);
            messageDiv.innerHTML = `<span style='color:red'>Gagal: ${error.message}</span>`;
        } else {
            console.log("Sukses:", data);
            messageDiv.innerHTML = "<span style='color:blue'>Password berhasil diubah! Mengalihkan...</span>";

            setTimeout(() => {
                window.location.href = "/login.html"; // Redirect ke halaman login
            }, 2000);
        }
    });
});
