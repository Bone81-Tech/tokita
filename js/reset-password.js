// 2. PERUBAHAN KRITIS: Menggunakan objek global 'supabase'
const supabaseClient = supabase.createClient(window.tokitaConfig.supabaseUrl, window.tokitaConfig.supabaseAnonKey)

document.addEventListener('DOMContentLoaded', function () {
    const newPasswordInput = document.getElementById('new-password');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message-div');

    // 1. DENGARKAN EVENT AUTH
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log("Status Auth Berubah:", event);

        if (event === "PASSWORD_RECOVERY") {
            messageDiv.innerHTML = "<span style='color:green'>Verifikasi berhasil. Silakan masukkan password baru.</span>";
            messageDiv.classList.remove('hidden');
            submitBtn.disabled = false;
        } else if (event === "SIGNED_OUT") {
             messageDiv.innerHTML = "<span style='color:red'>Link tidak valid atau kadaluarsa.</span>";
             messageDiv.classList.remove('hidden');
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
        
        if (newPassword.length < 6) {
            alert("Password minimal harus 6 karakter.");
            return;
        }

        messageDiv.innerText = "Sedang memvalidasi sesi...";
        messageDiv.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // Periksa sesi secara eksplisit sebelum update.
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

            if (sessionError || !session) {
                console.error("Session Error during password update:", sessionError);
                throw new Error("Sesi tidak valid atau telah habis. Silakan minta link reset password yang baru.");
            }

            console.log("Sesi valid, mencoba update password...");
            messageDiv.innerText = "Sedang memperbarui password...";

            const { data, error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            console.log("Sukses memperbarui password:", data);
            messageDiv.innerHTML = "<span style='color:blue'>Password berhasil diubah! Mengalihkan...</span>";
            
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2000);

        } catch (err) {
            console.error("Gagal dalam proses update password:", err);
            messageDiv.innerHTML = `<span style='color:red'>Gagal: ${err.message}</span>`;
        } finally {
            submitBtn.disabled = false;
        }
    });
});
