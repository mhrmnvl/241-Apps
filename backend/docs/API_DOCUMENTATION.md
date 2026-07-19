# Arsitektur API & Kontrak API SIAKAD

Dokumen ini menjelaskan arsitektur antarmuka program aplikasi (API), standar pertukaran data, format respons, penanganan error, serta spesifikasi kontrak endpoint (API Contract) yang digunakan pada backend SIAKAD.

---

## 🏛️ 1. Arsitektur API

Backend SIAKAD dibangun sebagai **RESTful API** berbasis HTTP/S menggunakan kerangka kerja **NestJS**. API dirancang dengan prinsip-prinsip berikut:

### A. Protokol & Format Data
*   **Protokol**: HTTP/1.1 atau HTTP/2 melalui koneksi aman (HTTPS).
*   **Format Payload**: JSON (`application/json`) untuk semua permintaan (request) dan tanggapan (response).
*   **Unggah Berkas**: Multipart Form Data (`multipart/form-data`) khusus untuk endpoint penyimpanan/unggahan berkas.

### B. Mekanisme Autentikasi & Keamanan
*   **Autentikasi**: Menggunakan **JSON Web Token (JWT)**.
*   **Transmisi Token**: Token dikirimkan melalui HTTP Header `Authorization` dengan skema **Bearer Token** (`Authorization: Bearer <token>`) atau dikelola secara aman melalui **HTTP-only Cookie** (tergantung konfigurasi client-server).
*   **Keamanan Ekstra**:
    *   **Helmet**: Diterapkan secara global untuk mengamankan HTTP Headers dari serangan umum (XSS, Clickjacking, dll).
    *   **CORS**: Dikonfigurasi secara ketat hanya mengizinkan domain frontend resmi.
    *   **Rate Limiting (Throttler)**: Batasan jumlah request per menit per alamat IP untuk mencegah serangan brute-force atau DDoS.

### C. Standardisasi Validasi & Transformasi Data
*   Setiap request body divalidasi secara ketat menggunakan kelas DTO dengan dekorator `class-validator` (seperti `@IsUUID()`, `@IsString()`, `@IsEmail()`).
*   Data input yang tidak dideklarasikan di DTO akan otomatis dibersihkan (stripped) menggunakan `ValidationPipe({ whitelist: true })` global untuk mencegah injeksi data liar (*parameter pollution*).

---

## 📥 2. Standardisasi Format Respons (API Envelope)

Seluruh respons API diseragamkan formatnya melalui global **NestJS Interceptor** dan **Exception Filter**. Hal ini memudahkan tim frontend dalam memproses data dengan struktur yang konsisten.

### A. Respons Sukses (Non-Paginated)
Digunakan untuk data tunggal (detail), pembuatan data (create), pembaruan data (update), dan penghapusan data (delete).

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "7b744d03-e847-49f3-8f0a-115f53715c0e",
    "name": "Matematika",
    "code": "MTK"
  }
}
```

### B. Respons Sukses dengan Pagasi (Paginated List)
Digunakan untuk endpoint yang mengambil daftar data berjumlah banyak. Data utama dibungkus di dalam `data`, sedangkan metadata pagasi dibungkus di dalam `meta`.

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "7b744d03-e847-49f3-8f0a-115f53715c0e",
      "name": "Matematika",
      "code": "MTK"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 10
  }
}
```

### C. Respons Gagal / Error
Ketika terjadi kesalahan (baik kesalahan validasi, data tidak ditemukan, konflik, maupun internal server error), respons akan dikembalikan dengan format:

```json
{
  "statusCode": 400,
  "message": "nisn must be a string; email must be an email address",
  "data": null
}
```
*Catatan: Kolom `message` dapat berupa teks tunggal atau gabungan teks validasi.*

---

## 📝 3. Kontrak API (API Contract) Utama

Berikut adalah spesifikasi kontrak endpoint utama pada sistem SIAKAD yang dibagi per modul fitur.

### A. Modul Autentikasi (`/auth`)

#### 1. Login Pengguna
*   **Path**: `POST /auth/login`
*   **Autentikasi**: None (Public)
*   **Request Body**:
    ```json
    {
      "username": "siswautama",
      "password": "PasswordSiswa123"
    }
    ```
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "9a1e0b57-61c0-4560-a292-127e99ff881a",
          "username": "siswautama",
          "role": "STUDENT"
        }
      }
    }
    ```

#### 2. Ambil Profil Pengguna Aktif (Who Am I)
*   **Path**: `GET /auth/me`
*   **Autentikasi**: Bearer Token
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Success",
      "data": {
        "id": "9a1e0b57-61c0-4560-a292-127e99ff881a",
        "username": "siswautama",
        "role": "STUDENT",
        "profile": {
          "name": "Ahmad Siswa",
          "nik": "3201020304050607",
          "email": "ahmad@school.sch.id"
        }
      }
    }
    ```

---

### B. Modul Data Siswa (`/students`)

#### 1. Ambil Daftar Siswa (Dengan Filter & Pagasi)
*   **Path**: `GET /students`
*   **Autentikasi**: Bearer Token (ADMIN, EMPLOYEE)
*   **Query Parameters**:
    *   `page` (opsional): Nomor halaman (default: `1`)
    *   `limit` (opsional): Jumlah item per halaman (default: `10`)
    *   `search` (opsional): Pencarian berdasarkan nama/NIS/NISN
    *   `status` (opsional): Filter status (`ACTIVE`, `GRADUATED`, dll)
    *   `classroomId` (opsional): Filter berdasarkan kelas aktif
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Success",
      "data": [
        {
          "id": "11a43b22-8d9e-4c7b-a456-789012345678",
          "nis": "24250001",
          "nisn": "0081234567",
          "status": "ACTIVE",
          "user": {
            "profile": {
              "name": "Budi Santoso",
              "gender": "MALE"
            }
          }
        }
      ],
      "meta": {
        "total": 450,
        "page": 1,
        "limit": 1
      }
    }
    ```

#### 2. Tambah Data Siswa Baru (Pendaftaran)
*   **Path**: `POST /students`
*   **Autentikasi**: Bearer Token (ADMIN)
*   **Request Body**:
    ```json
    {
      "username": "budisantoso",
      "password": "PasswordBudi123",
      "nis": "24250001",
      "nisn": "0081234567",
      "name": "Budi Santoso",
      "nik": "3201020304050999",
      "gender": "MALE",
      "birthPlace": "Jakarta",
      "birthDate": "2008-05-12",
      "classroomLevelId": "a2223cde-f123-4b67-a213-9876543210ab"
    }
    ```
*   **Respons Sukses (21 Created)**:
    ```json
    {
      "statusCode": 201,
      "message": "Student registered successfully",
      "data": {
        "id": "11a43b22-8d9e-4c7b-a456-789012345678",
        "nis": "24250001",
        "nisn": "0081234567",
        "status": "ACTIVE"
      }
    }
    ```

---

### C. Modul Kepegawaian & Guru (`/employees`)

#### 1. Ambil Daftar Alamat Karyawan (Flat Route)
*   **Path**: `GET /employee-addresses`
*   **Autentikasi**: Bearer Token (ADMIN, EMPLOYEE)
*   **Query Parameters**:
    *   `employeeId` (wajib): ID Karyawan yang ingin dilihat alamatnya
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Success",
      "data": [
        {
          "id": "f5b6c7d8-e9f0-4a1b-bc2d-3e4f5a6b7c8d",
          "street": "Jl. Kemerdekaan No. 45",
          "rt": "02",
          "rw": "05",
          "village": "Sukasari",
          "district": "Bogor Timur",
          "city": "Bogor",
          "province": "Jawa Barat",
          "postalCode": "16143",
          "isPrimary": true
        }
      ]
    }
    ```

#### 2. Tambah Alamat Karyawan
*   **Path**: `POST /employee-addresses`
*   **Autentikasi**: Bearer Token (ADMIN)
*   **Request Body**:
    ```json
    {
      "employeeId": "d7c6b5a4-e3f2-4a1b-bc2d-3e4f5a6b7c8d",
      "street": "Jl. Kemerdekaan No. 45",
      "rt": "02",
      "rw": "05",
      "village": "Sukasari",
      "district": "Bogor Timur",
      "city": "Bogor",
      "province": "Jawa Barat",
      "postalCode": "16143",
      "isPrimary": true
    }
    ```
*   **Respons Sukses (201 Created)**:
    ```json
    {
      "statusCode": 201,
      "message": "Address added successfully",
      "data": {
        "id": "f5b6c7d8-e9f0-4a1b-bc2d-3e4f5a6b7c8d",
        "employeeId": "d7c6b5a4-e3f2-4a1b-bc2d-3e4f5a6b7c8d",
        "street": "Jl. Kemerdekaan No. 45"
      }
    }
    ```

---

### D. Modul Rombongan Belajar / Kelas (`/classrooms` & `/student-enrollments`)

#### 1. Ambil Pengurus Kelas per Semester (Classroom Structure)
*   **Path**: `GET /classrooms/:classroomId/officers`
*   **Autentikasi**: Bearer Token
*   **Query Parameters**:
    *   `semesterId` (wajib): Filter ID Semester aktif
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Success",
      "data": {
        "id": "c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f",
        "classroomId": "8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
        "semesterId": "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
        "president": {
          "id": "student-id-1",
          "nis": "24250001",
          "name": "Budi Santoso"
        },
        "vicePresident": {
          "id": "student-id-2",
          "nis": "24250002",
          "name": "Siti Aminah"
        },
        "secretary": null,
        "treasurer": null
      }
    }
    ```

#### 2. Penetapan Pengurus Kelas (Assign Officers)
*   **Path**: `POST /classrooms/:classroomId/officers`
*   **Autentikasi**: Bearer Token (ADMIN, Wali Kelas)
*   **Request Body**:
    ```json
    {
      "semesterId": "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
      "presidentId": "student-id-1",
      "vicePresidentId": "student-id-2",
      "secretaryId": "student-id-3",
      "treasurerId": "student-id-4"
    }
    ```
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Classroom structure updated successfully",
      "data": {
        "classroomId": "8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
        "semesterId": "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d"
      }
    }
    ```

#### 3. Transfer Masal Siswa Lintas Kelas (Bulk Transfer Students)
Digunakan untuk menaikkan kelas siswa secara masal dalam satu request terpadu.
*   **Path**: `POST /student-enrollments/bulk-transfer`
*   **Autentikasi**: Bearer Token (ADMIN)
*   **Request Body**:
    ```json
    {
      "studentIds": [
        "student-id-1",
        "student-id-2",
        "student-id-3"
      ],
      "sourceClassroomId": "old-classroom-uuid",
      "targetClassroomId": "new-classroom-uuid",
      "targetSemesterId": "next-semester-uuid"
    }
    ```
*   **Respons Sukses (200 OK)**:
    ```json
    {
      "statusCode": 200,
      "message": "Successfully transferred 3 students to target classroom",
      "data": {
        "transferredCount": 3,
        "failedCount": 0
      }
    }
    ```

---

### E. Modul Penilaian & Presensi (`/assessment-items`, `/student-scores`, `/attendances`)

#### 1. Input Nilai Siswa per Item Penilaian
*   **Path**: `POST /student-scores`
*   **Autentikasi**: Bearer Token (Guru Pengampu)
*   **Request Body**:
    ```json
    {
      "enrollmentId": "enrollment-uuid-siswa",
      "assessmentItemId": "item-penilaian-uuid",
      "score": 88.5,
      "note": "Pengerjaan tugas sangat sistematis"
    }
    ```
*   **Respons Sukses (201 Created)**:
    ```json
    {
      "statusCode": 201,
      "message": "Score saved successfully",
      "data": {
        "id": "score-uuid-baru",
        "enrollmentId": "enrollment-uuid-siswa",
        "score": 88.5
      }
    }
    ```

#### 2. Pencatatan Kehadiran Siswa (Presensi)
*   **Path**: `POST /attendances`
*   **Autentikasi**: Bearer Token (Guru / Piket)
*   **Request Body**:
    ```json
    {
      "enrollmentId": "enrollment-uuid-siswa",
      "scheduleId": "schedule-uuid-mapel",
      "date": "2026-06-24",
      "status": "PRESENT",
      "note": ""
    }
    ```
*   **Respons Sukses (201 Created)**:
    ```json
    {
      "statusCode": 201,
      "message": "Attendance recorded successfully",
      "data": {
        "id": "attendance-uuid",
        "status": "PRESENT",
        "date": "2026-06-24"
      }
    }
    ```

---

## 🌐 4. Integrasi Dokumentasi Interaktif Swagger (OpenAPI)

Backend SIAKAD menyediakan dokumentasi interaktif **Swagger UI** secara langsung dari kode sumber utama (menggunakan dekorator seperti `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`).

*   **URL Lokal**: `http://localhost:3000/api-docs` (atau rute alternatif `/docs`)
*   **Fitur Swagger**:
    *   **Try It Out**: Uji coba request API secara langsung melalui browser.
    *   **Schema Viewer**: Melihat spesifikasi skema DTO, tipe data properti, dan properti wajib/opsional secara visual.
    *   **Auth Sandbox**: Memasukkan JWT Token di pojok kanan atas (`Authorize`) untuk menguji endpoint yang dilindungi Auth Guard.
