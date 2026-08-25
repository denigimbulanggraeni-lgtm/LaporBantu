document.addEventListener("DOMContentLoaded", function() {
    
    // Cek Sesi Login
    const userDataStr = localStorage.getItem("laporbantu_user");
    if (!userDataStr) {
        window.location.href = "index.html";
        return;
    }
    const userData = JSON.parse(userDataStr);

    const reportForm = document.getElementById("reportForm");
    const fileInput = document.getElementById("fileInput");
    const photoPreview = document.getElementById("photoPreview");
    const photoPlaceholder = document.getElementById("photoPlaceholder");
    const btnSubmit = document.getElementById("btnSubmit");
    const messageDiv = document.getElementById("reportMessage");

    let base64PhotoData = ""; // Variabel untuk menyimpan data foto yang sudah dikompres

    // 1. Logika Preview dan Kompresi Foto
    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Tampilkan loading sementara memproses gambar
        photoPlaceholder.innerHTML = "Memproses gambar...";

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = function() {
                // Proses Kompresi Menggunakan Canvas HTML5
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800; // Maksimal lebar foto 800px (sangat cukup dan ringan)
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                // Hitung rasio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Ubah hasil canvas ke format Base64 (Format JPG, Kualitas 70%)
                base64PhotoData = canvas.toDataURL("image/jpeg", 0.7);

                // Tampilkan di UI
                photoPreview.src = base64PhotoData;
                photoPreview.style.display = "inline-block";
                photoPlaceholder.style.display = "none";
            }
        };
        reader.readAsDataURL(file);
    });

    // 2. Logika Submit Data Laporan
    reportForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // Validasi jika foto belum dipilih
        if (!base64PhotoData) {
            showMessage("Anda wajib mengunggah foto bukti!", "error");
            return;
        }

        // Tampilkan status loading
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Mengirim Laporan... (Mohon tunggu)";
        showMessage("", "hidden");

        // Siapkan data untuk dikirim ke API
        const payload = {
            action: "createReport",
            user_id: userData.user_id,
            nis: userData.nis,
            nama: userData.nama,
            kelas: userData.kelas,
            kategori: document.getElementById("kategori").value,
            judul: document.getElementById("judul").value,
            lokasi: document.getElementById("lokasi").value,
            deskripsi: document.getElementById("deskripsi").value,
            foto_base64: base64PhotoData
        };

        // Kirim ke Backend
        const response = await callAPI(payload);

        if (response.success) {
            showMessage(`Laporan Berhasil Dikirim! (ID: ${response.data.report_id})`, "success");
            
            // Arahkan kembali ke dashboard setelah 2 detik
            setTimeout(() => {
                alert("Terima kasih, laporan Anda akan segera diproses oleh Admin.");
                window.location.href = "dashboard.html";
            }, 2000);
        } else {
            showMessage(response.message, "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Kirim Laporan";
        }
    });

    function showMessage(text, type) {
        messageDiv.innerText = text;
        messageDiv.className = `message ${type}`;
    }
});