document.addEventListener("DOMContentLoaded", async function() {
    
    const userDataStr = localStorage.getItem("laporbantu_user");
    if (!userDataStr) {
        window.location.href = "index.html";
        return;
    }
    const userData = JSON.parse(userDataStr);
    
    const reportContainer = document.getElementById("reportContainer");
    const loadingIndicator = document.getElementById("loadingIndicator");

    const payload = {
        action: "getReports",
        user_id: userData.user_id
    };

    // Panggil API
    const response = await callAPI(payload);
    loadingIndicator.style.display = "none";

    // KITA UBAH BAGIAN INI AGAR ERRORNYA TERLIHAT
    if (response.success) {
        if (response.data && response.data.length > 0) {
            response.data.forEach(report => {
                let statusClass = "status-menunggu";
                if (report.status === "DIPROSES") statusClass = "status-diproses";
                if (report.status === "SELESAI") statusClass = "status-selesai";
                if (report.status === "DITOLAK") statusClass = "status-ditolak";

                const tanggal = new Date(report.created_at).toLocaleDateString("id-ID", {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                const card = document.createElement("div");
                card.className = "report-card";
                card.innerHTML = `
                    <div class="foto-container" onclick="fokusLoadFoto(this, '${report.foto_url}')">
    <div class="foto-placeholder">📸<br>Ketuk<br>Muat</div>
    <img data-src="${report.foto_url}" class="report-img" alt="Foto">
</div>
                    <div class="report-info">
                        <h4>${report.judul}</h4>
                        <p>📍 ${report.lokasi} | 🏷️ ${report.kategori}</p>
                        <p>📅 ${tanggal}</p>
                        <span class="status-badge ${statusClass}">${report.status}</span>
                    </div>
                `;
                reportContainer.appendChild(card);
            });
        } else {
            reportContainer.innerHTML = `<div class="loading-text">Data laporan untuk Anda belum ditemukan di database.</div>`;
        }
    } else {
        // Tampilkan pesan error dari Google Apps Script
        reportContainer.innerHTML = `<div class="loading-text" style="color:red; font-weight:bold;">ERROR: ${response.message}</div>`;
    }
});
