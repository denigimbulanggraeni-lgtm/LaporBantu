document.addEventListener("DOMContentLoaded", function() {
    
    // Elemen Form
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const messageDiv = document.getElementById("authMessage");
    
    // Elemen Navigasi antar form
    const linkToRegister = document.getElementById("linkToRegister");
    const linkToLogin = document.getElementById("linkToLogin");

    // Fungsi menampilkan/menyembunyikan form
    linkToRegister.addEventListener("click", function(e) {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        showMessage("", "hidden");
    });

    linkToLogin.addEventListener("click", function(e) {
        e.preventDefault();
        registerForm.style.display = "none";
        loginForm.style.display = "block";
        showMessage("", "hidden");
    });

    // =====================================
    // 1. LOGIKA LOGIN (Sama seperti sebelumnya)
    // =====================================
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const btnLogin = document.getElementById("btnLogin");
        btnLogin.disabled = true;
        btnLogin.innerText = "Memeriksa data...";
        showMessage("", "hidden");

        const payload = {
            action: "login",
            nis: document.getElementById("nisLogin").value,
            nama: document.getElementById("namaLogin").value,
            kelas: "" // Kelas tidak lagi wajib saat login
        };

        const response = await callAPI(payload);

        if (response.success) {
            showMessage("Login Berhasil! Mengalihkan...", "success");
            localStorage.setItem("laporbantu_user", JSON.stringify(response.data));
            
            setTimeout(() => {
                if (response.data.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        } else {
            showMessage(response.message, "error");
            btnLogin.disabled = false;
            btnLogin.innerText = "Masuk Aplikasi";
        }
    });

    // =====================================
    // 2. LOGIKA REGISTRASI BARU
    // =====================================
    registerForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const btnRegister = document.getElementById("btnRegister");
        btnRegister.disabled = true;
        btnRegister.innerText = "Mendaftarkan...";
        showMessage("", "hidden");

        const payload = {
            action: "register",
            nis: document.getElementById("nisReg").value,
            nama: document.getElementById("namaReg").value,
            kelas: document.getElementById("kelasReg").value
        };

        const response = await callAPI(payload);

        if (response.success) {
            showMessage(response.message, "success");
            
            // Bersihkan form
            document.getElementById("nisReg").value = "";
            document.getElementById("namaReg").value = "";
            document.getElementById("kelasReg").value = "";
            
            // Kembalikan ke halaman login setelah 2 detik
            setTimeout(() => {
                registerForm.style.display = "none";
                loginForm.style.display = "block";
                showMessage("Silakan login dengan akun baru Anda.", "success");
            }, 2500);
        } else {
            showMessage(response.message, "error");
        }
        
        btnRegister.disabled = false;
        btnRegister.innerText = "Daftar Sekarang";
    });

    // Fungsi menampilkan notifikasi error/sukses
    function showMessage(text, type) {
        messageDiv.innerText = text;
        messageDiv.className = `message ${type}`; 
    }
});