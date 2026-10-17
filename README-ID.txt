TOOLS BY KENZ — PAKET WEBSITE
============================

ISI PAKET
- index.html : tampilan website, foto latar sudah tertanam, katalog 1.000 tools.
- server.js  : server website + endpoint backend AI aman.
- package.json : perintah untuk menjalankan server.
- .env.example : contoh konfigurasi.

MENJALANKAN DI KOMPUTER
1. Instal Node.js versi 18 atau lebih baru dari https://nodejs.org/.
2. Ekstrak ZIP ini ke folder.
3. Buat API key di Google AI Studio: https://aistudio.google.com/apikey
4. Set environment variable GEMINI_API_KEY dengan API key tersebut. Jangan pernah kirim atau unggah key ke orang lain dan jangan menaruhnya di index.html.
   Windows PowerShell (untuk jendela ini saja):
     $env:GEMINI_API_KEY="API_KEY_KAMU"
     node server.js
   macOS/Linux:
     GEMINI_API_KEY="API_KEY_KAMU" node server.js
5. Buka http://localhost:3000
6. Tes status AI di http://localhost:3000/api/health

PENTING
- File HTML tunggal dapat membuka katalog tools, tetapi AI generatif memerlukan server berjalan dan API key yang valid.
- Untuk menjadikan website online, deploy seluruh folder ini ke host Node.js yang mendukung environment variables. Isi GEMINI_API_KEY di pengaturan rahasia/environment host, bukan dalam file HTML.
- Gemini API dapat memiliki kuota, kebijakan, dan biaya sesuai akun/model. Periksa https://ai.google.dev/gemini-api/docs/pricing sebelum dipakai ramai-ramai.
- Hanya tombol download video TikTok yang diarahkan ke SSSTikTok. Situs pihak ketiga dapat berubah sewaktu-waktu.
- Katalog menyediakan ruang kerja generik bagi tools yang berbeda. Tidak semua 1.000 item adalah implementasi algoritme khusus; operasi seperti editor video penuh, OCR, konversi format proprietary, dan beberapa fitur server memerlukan layanan/library tambahan.


PEMBARUAN AI PINTAR BY KENZ (Gemini langsung dari browser)
1. Buka website, buka panel AI PINTAR BY KENZ.
2. Buat API key di https://aistudio.google.com/apikey.
3. Tempel key ke kolom API key di panel AI dan tekan Simpan API key.
4. Kirim pertanyaan. Key disimpan di localStorage browser pada perangkat itu.
PENTING: jangan menanam key pribadi langsung ke HTML publik. Penggunaan Gemini API tunduk pada kuota dan ketentuan Google.
