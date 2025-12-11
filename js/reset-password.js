// 2. PERUBAHAN KRITIS: Menggunakan objek global 'supabase'
const supabaseClient = supabase.createClient(window.tokitaConfig.supabaseUrl, window.tokitaConfig.supabaseAnonKey)

document.addEventListener('DOMContentLoaded', function () {
    const newPasswordInput = document.getElementById('new-password');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message-div'); // Changed from 'message' to 'message-div'

    // 1. DENGARKAN EVENT AUTH
    // Saat halaman dimuat, Supabase akan otomatis memakan token URL
    // dan memicu event 'PASSWORD_RECOVERY'.
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log("Status Auth Berubah:", event);

        if (event === "PASSWORD_RECOVERY") {
            // Ini adalah tanda bahwa link email valid!
            // User sekarang dalam keadaan "Login Sementara".
            messageDiv.innerHTML = "<span style='color:green'>Verifikasi berhasil. Silakan masukkan password baru.</span>";
            messageDiv.classList.remove('hidden'); // Show message
            submitBtn.disabled = false;
        } else if (event === "SIGNED_OUT") {
            // Jika user tidak login, mungkin token sudah kadaluarsa sebelum halaman dimuat
             messageDiv.innerHTML = "<span style='color:red'>Link tidak valid atau kadaluarsa.</span>";
             messageDiv.classList.remove('hidden'); // Show message
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
        messageDiv.classList.remove('hidden'); // Show message

        // KUNCI UTAMA: Kita menggunakan 'updateUser', BUKAN memverifikasi token lagi.
        // Kita mengandalkan sesi yang sudah terbentuk di langkah 1.
        
        messageDiv.innerText = "Sedang memvalidasi sesi...";
        messageDiv.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // LANGKAH DEBUGGING BARU: Periksa sesi secara eksplisit sebelum update.
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

            if (sessionError || !session) {
                console.error("Session Error:", sessionError);
                console.error("Session Data:", session);
                throw new Error("Sesi tidak valid atau tidak ditemukan. Silakan coba lagi dari link email.");
            }

            console.log("Sesi valid, mencoba update password...", session);
            messageDiv.innerText = "Sedang memperbarui password...";

            const { data, error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                // Jika ada error dari updateUser, lempar untuk ditangkap oleh catch block.
                throw error;
            }

            if (data) {
                console.log("Sukses memperbarui password:", data);
                messageDiv.innerHTML = "<span style='color:blue'>Password berhasil diubah! Mengalihkan...</span>";
                
                setTimeout(() => {
                    window.location.href = "/login.html"; // Redirect ke halaman login
                }, 2000);
            } else {
                // Kasus aneh jika tidak ada data maupun error.
                throw new Error("Proses update selesai tanpa data maupun error. Kondisi tidak terduga.");
            }

        } catch (err) {
            console.error("Gagal dalam proses update password:", err);
            messageDiv.innerHTML = `<span style='color:red'>Gagal: ${err.message}</span>`;
            messageDiv.classList.remove('hidden'); // Pastikan div terlihat saat error.
        } finally {
            submitBtn.disabled = false;
        }
    });
});
