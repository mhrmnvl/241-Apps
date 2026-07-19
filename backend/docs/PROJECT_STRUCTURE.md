# Struktur Folder Proyek SIAKAD Backend

Dokumen ini memberikan gambaran komprehensif mengenai struktur folder dan organisasi kode dalam proyek backend SIAKAD (Sistem Informasi Akademik) yang dibangun menggunakan **NestJS**, **Prisma**, dan **pnpm**.

---

## 📂 Pohon Struktur Folder Utama

```text
siakad-backend/
├── 📁 .github/              # Konfigurasi GitHub Actions / CI-CD
├── 📁 .husky/                # Git hooks untuk linting dan formatting otomatis
├── 📁 .vscode/               # Konfigurasi workspace VS Code
├── 📁 Standarized/           # Dokumentasi standarisasi dan kebutuhan backend
│   ├── Standarized.md
│   ├── backend-refactoring-notes.md
│   └── backend-requirements.md
├── 📁 api/                   # Entry point / serverless handler untuk deployment (Vercel)
│   └── index.ts
├── 📁 dist/                  # Hasil build/kompilasi proyek (dihasilkan otomatis)
├── 📁 node_modules/          # Dependensi pihak ketiga (dihasilkan oleh pnpm)
├── 📁 prisma/                # Skema basis data Prisma & Skrip Seed
│   ├── 📁 migrations/        # Riwayat migrasi database
│   ├── 📁 seeds/             # File penunjang untuk seeding data
│   ├── schema.prisma         # Skema utama Prisma
│   ├── [feature].prisma      # Skema Prisma yang dipecah per modul (modular)
│   └── seed.ts               # Skrip utama seeding database
├── 📁 src/                   # Kode sumber utama aplikasi (NestJS)
│   ├── app.module.ts         # Root module aplikasi
│   ├── main.ts               # Entry point aplikasi NestJS
│   ├── 📁 core/              # Konfigurasi inti dan modul infrastruktur global
│   ├── 📁 features/          # Modul bisnis/fitur aplikasi (Domain-Driven)
│   ├── 📁 shared/            # Helper, DTO, dan utilitas bersama
│   └── 📁 types/             # Definisi tipe TypeScript kustom
├── 📁 test/                  # Pengujian E2E (End-to-End)
└── 📄 File Konfigurasi Root (di tingkat teratas)
```

---

## 🔍 Penjelasan Detail Setiap Folder

### 1. `src/` (Source Code Utama)
Merupakan direktori utama tempat seluruh logika bisnis aplikasi NestJS ditulis.

*   **`main.ts`**: Menginisialisasi aplikasi NestJS, menerapkan middleware global (seperti CORS, global pipes, global filters), dan mendengarkan port server.
*   **`app.module.ts`**: Root module yang mendaftarkan seluruh modul fitur (`features`) dan infrastruktur (`core`).
*   **`core/`**: Menyimpan modul-modul sistem/infrastruktur dasar yang digunakan secara global:
    *   `config/`: Konfigurasi variabel lingkungan (environment variables).
    *   `database/`: Layanan koneksi database (Prisma Service).
    *   `decorators/`: Decorator kustom NestJS (misal: `@CurrentUser`).
    *   `filters/`: Exception filters global untuk menangani error HTTP/database.
    *   `guards/`: Penjaga rute (misal: Auth Guard, Roles Guard).
    *   `interceptors/`: Interceptor global untuk memformat respon atau logging.
    *   `logger/`: Layanan logging aplikasi.
    *   `storage/`: Layanan penyimpanan file/media.
    *   `supabase/`: Integrasi dengan Supabase (jika digunakan).
*   **`shared/`**: Logika penunjang yang dapat digunakan kembali di lintas modul fitur:
    *   `dto/`: Data Transfer Object global (seperti DTO untuk pagination/query parameter).
    *   `helpers/`: Fungsi utilitas umum (utility functions).
    *   `transformers/`: Logika untuk mengubah format data input/output.
*   **`types/`**: Deklarasi tipe data TypeScript tambahan atau kustom.

---

### 2. `src/features/` (Modul Bisnis / Domain-Driven)
Proyek ini menggunakan pendekatan modular di mana setiap fitur atau domain bisnis memiliki foldernya sendiri. Setiap subfolder di bawah `features` umumnya berisi:
*   `[name].module.ts` (Mendaftarkan controller dan provider fitur)
*   `[name].controller.ts` (Mengangani HTTP requests/routing)
*   `[name].service.ts` (Logika bisnis utama dan interaksi database)
*   `dto/` (Validasi data transfer object khusus fitur ini)
*   `entities/` (Representasi struktur data/respons)

Daftar modul fitur yang tersedia meliputi:
*   **Autentikasi & Akun**: `auth`, `users`, `profile`, `profile-address`, `profile-social-media`
*   **Akademik & Kurikulum**: `academic-calendar`, `academic-year`, `semester`, `curriculum`, `curriculum-subject`, `subject`, `time-slot`, `schedule`
*   **Manajemen Kelas & Pengajaran**: `classroom`, `classroom-level`, `classroom-structure`, `classroom-supervisor`, `teaching-assignment`
*   **Siswa (Student)**: `student`, `student-profile`, `student-address`, `student-parent`, `student-enrollment`, `student-graduation`
*   **Karyawan & Pendidik (Employee)**: `employee`, `employee-address`, `employee-position`, `position`
*   **Penilaian & Hasil Belajar**: `assessment-item`, `student-score`, `rapor`, `achievement`, `scholarship`
*   **Kehadiran & Aktivitas**: `attendance`, `event`, `announcement`
*   **Institusi & Umum**: `institution`, `institution-address`, `institution-social-media`, `address`, `occupation`, `parent`, `platform`, `dashboard`

---

### 3. `prisma/` (Manajemen Database)
Menggunakan ORM Prisma untuk interaksi dengan database.
*   **`schema.prisma`**: File skema utama Prisma yang mengimpor atau menggabungkan konfigurasi database.
*   **Modular Skema (`*.prisma`)**: Skema database dipecah berdasarkan modul untuk kemudahan pemeliharaan (seperti `academic.prisma`, `student.prisma`, `auth.prisma`, dll).
*   **`seed.ts` & file `seed-*.ts`**: Berisi skrip untuk memasukkan data awal (seeding) ke dalam database untuk keperluan development atau testing.
*   **`seeds/`**: Folder yang menampung file data JSON atau helper yang digunakan oleh skrip seeding.

---

### 4. `Standarized/` (Standardisasi Proyek)
Menyimpan dokumen penting yang memandu arah pengembangan aplikasi agar tetap konsisten:
*   **`Standarized.md`**: Standar arsitektur, konvensi penamaan, struktur respons API, dan aturan penulisan kode.
*   **`backend-refactoring-notes.md`**: Catatan mengenai bagian kode yang perlu diperbaiki atau dioptimalkan.
*   **`backend-requirements.md`**: Dokumen persyaratan fungsional dan teknis backend.

---

### 5. File Konfigurasi Root (Root Configurations)
Berbagai konfigurasi alat bantu pengembangan di tingkat proyek:
*   **`package.json`**: Daftar dependensi, script perintah (run, build, test), dan metadata proyek.
*   **`pnpm-lock.yaml` & `pnpm-workspace.yaml`**: Mengelola versi dependensi secara terkunci dan mendefinisikan workspace monorepo/multirepo jika ada.
*   **`tsconfig.json` & `tsconfig.build.json`**: Konfigurasi compiler TypeScript untuk pengembangan dan build produksi.
*   **`eslint.config.mjs` & `eslint.typecheck.config.mjs`**: Aturan linting untuk menjaga kualitas dan gaya penulisan kode TypeScript.
*   **`.prettierrc` & `.prettierignore`**: Pengaturan formatter kode otomatis untuk menjaga kerapian penulisan.
*   **`nest-cli.json`**: Konfigurasi utilitas baris perintah NestJS CLI.
*   **`vercel.json`**: Konfigurasi deployment untuk platform Vercel.
*   **`.env` & `.env.example`**: Konfigurasi variabel lingkungan lokal (kunci API, URL database, dll).
