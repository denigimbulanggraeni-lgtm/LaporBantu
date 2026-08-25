// Konfigurasi API
// HAPUS TEKS DI BAWAH DAN PASTE URL WEB APP ANDA DI DALAM TANDA KUTIP
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyrdp0Aes-mn5qt_w2NWrQvBR7x6IKpDNIavKi6jl-AhrZkEt-NZe1ROXpgkmMwSTWJLA/exec'; 

/**
 * Fungsi untuk mengirim data ke Google Apps Script
 */
async function callAPI(payload) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            // Menggunakan mode 'no-cors' akan menyembunyikan response.
            // Kita biarkan default agar bisa membaca JSON dari Apps Script.
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API Error:", error);
        return {
            success: false,
            message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        };
    }
}