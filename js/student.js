document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Cek Sesi Login
    const userDataStr = localStorage.getItem("laporbantu_user");
    if (!userDataStr) { window.location.href = "index.html"; return; }
    const userData = JSON.parse(userDataStr);

    // 2. Tampilkan data teks dari memori (Nama, Kelas, Poin Awal)
    document.getElementById("userName").innerText = `Halo, ${userData.nama}!`;
    document.getElementById("userClass").innerText = `Kelas: ${userData.kelas}`;
    document.getElementById("userPoints").innerText = userData.poin;

    // 3. FUNGSI BARU: Ambil Statistik dari Server (Database)
    async function muatStatistik() {
        // Karena ini file JavaScript biasa yang memanggil callAPI,
        // pastikan fungsi ini berjalan secara asynchronous
        const payload = {
            action: "getReports",
            user_id: userData.user_id // Hanya ambil laporan milik siswa ini
        };

        const response = await callAPI(payload);

        if (response.success && response.data) {
            // Hitung total semua laporan miliknya
            const totalLaporan = response.data.length;
            
            // Hitung laporan yang statusnya hanya "SELESAI"
            const totalSelesai = response.data.filter(laporan => laporan.status === "SELESAI").length;

            // Masukkan angka tersebut ke HTML
            document.getElementById("statTotal").innerText = totalLaporan;
            document.getElementById("statSelesai").innerText = totalSelesai;
        } else {
            // Jika belum ada data
            document.getElementById("statTotal").innerText = "0";
            document.getElementById("statSelesai").innerText = "0";
        }
    }

    // Jalankan fungsinya
    muatStatistik();

    // 4. Fitur Logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            if (confirm("Apakah Anda yakin ingin keluar?")) {
                localStorage.removeItem("laporbantu_user");
                window.location.href = "index.html";
            }
        });
    }
});