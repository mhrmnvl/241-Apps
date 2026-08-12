Saya ingin melakukan audit terhadap codebase untuk mengetahui apakah sistem saat ini sudah memiliki fondasi untuk integrasi mesin presensi fisik berbasis RFID/NFC/IoT yang terhubung ke SIAKAD melalui VPS.

JANGAN langsung mengubah kode atau membuat implementasi baru.

Baca dan telusuri seluruh codebase terlebih dahulu. Cari semua bagian yang berkaitan dengan:

1. Attendance / presensi
2. RFID / NFC / QR / card / kartu
3. Attendance device / device registration
4. Device authentication / device token / API key
5. Offline attendance / local queue / sync / retry
6. Attendance event / attendance log
7. Idempotency / duplicate prevention
8. SchoolUnit / tenant isolation
9. Student / Teacher / Employee dan relasi kartu/identity
10. Timestamp, timezone, server time, client time
11. Endpoint/API yang kemungkinan digunakan oleh perangkat eksternal
12. Background job / queue / synchronization mechanism
13. Database schema/model yang dapat mendukung perangkat presensi
14. Configuration/env yang berkaitan dengan device atau external integration

Telusuri bukan hanya nama file yang secara eksplisit bernama "attendance". Periksa juga module, domain, service, repository, schema Prisma, controller, DTO, guard, middleware, config, migration, test, dan utility yang mungkin secara tidak langsung mendukung kebutuhan tersebut.

Tujuan audit:

Saya ingin mengetahui apakah arsitektur saat ini sudah siap jika suatu saat saya membuat perangkat seperti:

RFID/NFC Reader
→ ESP32
→ Wi-Fi
→ HTTPS
→ SIAKAD API di VPS
→ Attendance

Dan perangkat harus tetap dapat mencatat presensi ketika koneksi internet sementara terputus, lalu melakukan sinkronisasi ketika koneksi kembali.

Jangan mengasumsikan fitur tersebut sudah ada hanya karena terdapat nama/konsep yang mirip.

Setelah selesai membaca codebase, buat laporan dengan struktur berikut:

A. YANG SUDAH ADA
- Fitur/komponen yang benar-benar sudah diimplementasikan
- Lokasi file/module
- Model database terkait
- Endpoint terkait
- Jelaskan fungsi sebenarnya

B. YANG SUDAH DISIAPKAN TETAPI BELUM LENGKAP
Untuk setiap item jelaskan:
- Apa yang sudah tersedia
- Apa yang masih kurang
- Apakah fondasinya bisa langsung digunakan
- Risiko jika dipaksakan digunakan

C. YANG BELUM ADA
Identifikasi komponen yang benar-benar belum tersedia untuk mendukung:
- device registration
- device authentication
- card binding
- offline queue
- synchronization
- retry
- idempotency
- device heartbeat
- device status
- audit trail

D. KECUKUPAN ARSITEKTUR
Berikan penilaian:
1. Ready
2. Mostly ready
3. Partially ready
4. Not ready

Berikan alasan teknis yang konkret.

E. TRACE ALUR YANG SUDAH ADA

Gambarkan alur aktual dari codebase, bukan desain ideal.

Contoh:

Card/User
→ ...
→ ...
→ AttendanceService
→ ...
→ Database

Jika belum ada alurnya, katakan dengan jelas.

F. GAP ANALYSIS

Buat tabel:

| Requirement | Sudah Ada | Lokasi | Status | Gap |
|-------------|-----------|--------|--------|-----|

G. REKOMENDASI

Pisahkan menjadi:

1. Tidak perlu diubah
2. Perlu refactor
3. Perlu ditambahkan
4. Jangan dibuat karena redundant

H. HAL YANG JANGAN DIBUAT

Identifikasi jika ada bagian yang sebenarnya sudah ditangani oleh architecture/codebase sehingga agent tidak perlu membuat abstraction, service, model, atau module baru yang redundant.

ATURAN PENTING:

- Jangan membuat kode.
- Jangan melakukan refactor.
- Jangan membuat migration.
- Jangan mengubah schema.
- Jangan mengasumsikan requirement yang belum ada.
- Jangan menyarankan arsitektur baru sebelum memahami arsitektur yang sekarang.
- Bedakan dengan jelas antara "sudah diimplementasikan", "sudah disiapkan", dan "belum ada".
- Sertakan path file dan nama class/function/model ketika menemukan sesuatu.
- Jika ada beberapa module yang memiliki fungsi mirip, jelaskan apakah memang berbeda responsibility atau terjadi duplication.
- Jika menemukan desain yang sudah mendukung offline sync/device integration secara tidak langsung, jelaskan hubungan tersebut.
- Prioritaskan reuse terhadap abstraction yang sudah ada daripada membuat abstraction baru.

Pada akhir laporan, jawab secara eksplisit pertanyaan ini:

"Jika saya besok membeli RFID/NFC reader dan membuat device ESP32 yang mengirim data presensi ke VPS, bagian mana dari codebase saya yang sudah bisa langsung dipakai, dan bagian mana yang harus dibuat terlebih dahulu?"