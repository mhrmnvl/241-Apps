# SIMAS 241 - Frontend (`inventory-web`)

**Sistem Informasi Manajemen Aset MTs Persis 241 Al-Ikhlash**

Aplikasi *frontend* untuk tata kelola aset & inventaris sekolah (aset, sirkulasi, approval).

> **Bagian dari monorepo `241-apps`.** Instalasi, konvensi arsitektur, dan batas
> antar-package dijelaskan di [README root monorepo](../../README.md). Kode bersama
> (UI, composables, fitur platform) berada di `packages/*`, **bukan** di dalam app ini.

---

## Arsitektur & Standar Pengembangan (WAJIB DIBACA)

Aplikasi ini dibangun menggunakan **Vue 3 Feature-Driven Architecture (Strict Domain)** —
**1 Domain = 1 Feature**. Patuhi konvensi ini secara ketat demi skalabilitas kode.

### Struktur Direktori App
```text
apps/inventory/src/
├── app/                  # Titik masuk (main.ts, App.vue, router & store providers)
├── components/layout/    # Komponen layout app-specific (AppSidebar, NavMain)
├── config/               # menuConfig — navigasi khusus app ini
├── layouts/              # Komponen layout global
├── features/
│   └── inventory/        # CORE DOMAIN app ini (asset, circulation, approval, dll)
└── style.css             # Tailwind v4 entry + theme tokens
```

Kode bersama dikonsumsi dari package (lihat README root):
```text
@/ui                  → packages/ui        (@241/ui)       komponen shadcn-vue + cn()
@/shared/*            → packages/shared     (@241/shared)   composables, utils, types, api
@/features/platform/* → packages/platform   (@241/platform) auth, profile, dashboard, role…
```

### Struktur Internal Fitur (Per Module)
Setiap fitur di dalam `features/inventory/` dan `features/platform/` diwajibkan untuk memiliki struktur terisolasi berikut:
```text
feature-name/
├── api/            # HTTP ONLY (wajib, khusus domain terkait)
├── services/       # BUSINESS LOGIC & Cross-Feature Imports
├── stores/         # STATE (Pinia)
├── composables/    # LOGIC REUSABLE
├── components/     # UI INTERNAL khusus fitur
├── views/          # Halaman vue (opsional)
├── types/          # Type & Interface khusus fitur
└── index.ts        # PUBLIC API (WAJIB, Semua export dilakukan lewat sini)
```
Pastikan untuk mempertahankan struktur terisolasi ini dan memperhatikan aturan impor antar fitur guna menghindari implementasi yang tumpang tindih (*Anti-Pattern*) dan menjaga alur *best practices* di keseluruhan proyek ini.

---

## Tech Stack & Alat Pengembangan

Aplikasi ini dikembangkan menggunakan *stack* terdepan di ekosistem Vue:
- **[Vue 3](https://vuejs.org/)** (Composition API & `<script setup>`)
- **[TypeScript](https://www.typescriptlang.org/)** untuk *type-safety* yang ketat
- **[Vite](https://vitejs.dev/)** sebagai *build tool* tercepat
- **[Tailwind CSS v4](https://tailwindcss.com/)** untuk *utility-first styling*
- **[shadcn/ui (shadcn-vue)](https://www.shadcn-vue.com/)** & **[Reka UI](https://reka-ui.com/)** untuk komponen UI modular yang *accessible*
- **[Pinia](https://pinia.vuejs.org/)** untuk manajemen *state* terpusat (*Store*)
- **[Vue Router](https://router.vuejs.org/)** untuk pengaturan navigasi dinamis (*Single Page Application*)
- **[vee-validate](https://vee-validate.logaretm.com/)** & **[Zod](https://zod.dev/)** untuk penanganan form dan validasi yang kompleks
- **[Axios](https://axios-http.com/)** sebagai standar HTTP client

## Fitur Modul Bisnis Utama

Bagian frontend ini telah terbagi ke dalam berbagai fitur *core domain* independen, antara lain:
- **Sistem Otentikasi (`auth`)**
- **Manajemen Akun Terpadu (`profile`)**
- **Sistem Informasi Inventaris (`inventory`)**

## Cara Menjalankan Project (Local Development)

Pastikan Anda sudah menginstal **Node.js** (direkomendasikan versi v22+ atau LTS terbaru) dan **pnpm** (v10+).

### 1. Instalasi Dependensi
Jalankan pnpm untuk menginstal dependensi (ini juga akan menginisialisasi Husky git hooks secara otomatis):
```bash
pnpm install
```

### 2. Pengaturan Environment Variable
Buat salinan file atau buat file baru bernama `.env` (atau `.env.local`) di direktori utama (sejajar dengan package.json) dan sesuaikan `VITE_API_BASE_URL` ke backend API:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
*(Sesuaikan base URL dengan backend Anda jika berbeda)*

### 3. Memulai Development Server
```bash
pnpm run dev
```
Buka *browser* baru dan kunjungi aplikasi yang berjalan di **[http://localhost:5173/](http://localhost:5173/)** (atau port alternatif lain yang disediakan oleh Vite jika `5173` sedang digunakan).

### 4. Build untuk Production
Untuk menyusun *deployment bundle* yang sangat teroptimasi:
```bash
pnpm run build
```

---

## Kualitas Kode & Git Hooks

Aplikasi ini menggunakan **Husky** dan **lint-staged** untuk memelihara kualitas kode sebelum disimpan ke repositori.

- **`pre-commit` hook**: Menjalankan linting otomatis menggunakan ESLint dan formatting menggunakan Prettier khusus untuk file-file yang dimodifikasi (*staged files*).
- Untuk menjalankan pengecekan kualitas kode secara manual:
  ```bash
  # Cek format & lint cepat
  pnpm run check
  
  # Jalankan validasi penuh (format + lint + typecheck + build)
  pnpm run validate
  ```

---
*Dikelola untuk MTs Persis 241 Al-Ikhlash.*
