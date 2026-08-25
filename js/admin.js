document.addEventListener("DOMContentLoaded", async function() {
    
    // 1. CEK LOGIN
    const userDataStr = localStorage.getItem("laporbantu_user");
    if (!userDataStr) { window.location.href = "index.html"; return; }
    const userData = JSON.parse(userDataStr);
    if (userData.role !== 'admin') { alert("Akses Ditolak!"); window.location.href = "index.html"; return; }
    document.getElementById("adminName").innerText = userData.nama;
    
    // 2. FUNGSI LOGOUT
    document.getElementById("btnLogout").addEventListener("click", function() {
        if(confirm("Keluar dari panel admin?")) {
            localStorage.removeItem("laporbantu_user"); window.location.href = "index.html";
        }
    });

    const reportContainer = document.getElementById("adminReportContainer");
    
    // 3. FUNGSI MENAMPILKAN LAPORAN
    async function loadReports() {
        reportContainer.innerHTML = "<div style='text-align:center; padding:20px;'>Memuat data...</div>";
        const response = await callAPI({ action: "getReports" });
        reportContainer.innerHTML = ""; 

        if (response.success && response.data && response.data.length > 0) {
            response.data.forEach(report => {
                let statusClass = "status-menunggu";
                if (report.status === "DIPROSES") statusClass = "status-diproses";
                if (report.status === "SELESAI") statusClass = "status-selesai";
                if (report.status === "DITOLAK") statusClass = "status-ditolak";

                const tanggal = new Date(report.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });

                // INI YANG MENENTUKAN TOMBOL MANA YANG MUNCUL
                let actionButton = '';
                if (report.status === 'MENUNGGU') {
                    // Munculkan tombol biru
                    actionButton = `<button class="btn-proses" onclick="window.openModal('${report.report_id}')">Tindak Lanjuti</button>`;
                } else if (report.status === 'DIPROSES') {
                    // Munculkan tombol kuning (upload bukti)
                    actionButton = `<button style="background:#fbbc04; color:#333; padding:8px 15px; border:none; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold;" onclick="window.openFinishModal('${report.report_id}')">Selesaikan Laporan</button>`;
                } else {
                    // Jika sudah selesai
                    actionButton = `<span style="color:#666; font-size:12px; font-weight:bold;">Telah Diselesaikan</span>`;
                }

                const card = document.createElement("div");
                card.className = "report-card";
                card.innerHTML = `
                    <div class="foto-container" onclick="fokusLoadFoto(this, '${report.foto_url}')">
    <div class="foto-placeholder">📸<br>Ketuk<br>Muat</div>
    <img data-src="${report.foto_url}" class="report-img" alt="Foto">
</div>
                    <div class="report-info">
                        <h4>${report.judul}</h4>
                        <p>📍 ${report.lokasi} | 📅 ${tanggal}</p>
                        <span class="status-badge ${statusClass}">${report.status}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        ${actionButton}
                    </div>
                `;
                reportContainer.appendChild(card);
            });
        } else {
            reportContainer.innerHTML = `<div style="text-align:center; padding:20px;">Belum ada laporan.</div>`;
        }
    }
    loadReports(); // Jalankan saat pertama buka halaman

    // ==========================================
    // 4. KOTAK POP-UP 1 (TERIMA/TOLAK)
    // ==========================================
    let currentSelectedReportId = ""; 
    window.openModal = function(reportId) {
        currentSelectedReportId = reportId;
        document.getElementById("modalReportId").innerText = reportId;
        document.getElementById("actionModal").style.display = "flex"; 
    };

    document.getElementById("btnSaveStatus").addEventListener("click", async function() {
        const btnSave = document.getElementById("btnSaveStatus");
        btnSave.disabled = true; btnSave.innerText = "Menyimpan...";
        
        const payload = {
            action: "updateReportStatus",
            report_id: currentSelectedReportId,
            status: document.getElementById("modalStatusSelect").value,
            admin_id: userData.user_id
        };
        const response = await callAPI(payload);
        if (response.success) {
            document.getElementById("actionModal").style.display = "none";
            loadReports(); 
        }
        btnSave.disabled = false; btnSave.innerText = "Simpan";
    });

    // ==========================================
    // 5. KOTAK POP-UP 2 (SELESAIKAN & UPLOAD BUKTI)
    // ==========================================
    let base64FinishPhoto = "";
    const finishPhotoInput = document.getElementById("finishPhotoInput");
    const finishPhotoPreview = document.getElementById("finishPhotoPreview");

    // Fungsi membuka kotak pop up kedua
    window.openFinishModal = function(reportId) {
        currentSelectedReportId = reportId;
        document.getElementById("finishReportId").innerText = reportId;
        document.getElementById("finishNote").value = "";
        finishPhotoInput.value = "";
        finishPhotoPreview.style.display = "none";
        base64FinishPhoto = "";
        document.getElementById("finishMessage").className = "message hidden";
        document.getElementById("finishModal").style.display = "flex";
    };

    // Fungsi kompres gambar ketika Admin memilih foto
    finishPhotoInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let width = img.width; let height = img.height;
                if (width > height) { if (width > 800) { height *= 800 / width; width = 800; } } 
                else { if (height > 800) { width *= 800 / height; height = 800; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                base64FinishPhoto = canvas.toDataURL("image/jpeg", 0.7);
                finishPhotoPreview.src = base64FinishPhoto;
                finishPhotoPreview.style.display = "block";
            }
        };
        reader.readAsDataURL(file);
    });

    // Fungsi klik tombol "Kirim Bukti"
    document.getElementById("btnSubmitFinish").addEventListener("click", async function() {
        if (!base64FinishPhoto) {
            alert("Harap pilih foto bukti perbaikan terlebih dahulu!"); return;
        }

        const btnSubmit = document.getElementById("btnSubmitFinish");
        btnSubmit.disabled = true; btnSubmit.innerText = "Mengunggah...";

        const payload = {
            action: "uploadCompletion",
            report_id: currentSelectedReportId,
            admin_id: userData.user_id,
            catatan: document.getElementById("finishNote").value,
            foto_base64: base64FinishPhoto
        };

        const response = await callAPI(payload);
        
        if (response.success) {
            document.getElementById("finishModal").style.display = "none";
            alert("Selesai! Bukti terkirim dan poin otomatis diberikan ke Siswa.");
            loadReports(); // Muat ulang layar
        } else {
            alert("Error: " + response.message);
        }
        btnSubmit.disabled = false; btnSubmit.innerText = "Kirim Bukti";
    });
});
