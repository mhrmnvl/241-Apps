# 241 Apps — Monorepo

Monorepo untuk sistem informasi **MTs Persis 241 Al-Ikhlash**. Berisi dua aplikasi
frontend (Vue 3) yang berbagi kode lewat *shared packages*, plus backend NestJS.

| Bagian | Nama paket | Deskripsi |
|---|---|---|
| `apps/academic` | `academic-web` | **SIAKAD 241** — Sistem Informasi Akademik (siswa, GTK, kurikulum, jadwal, nilai) |
| `apps/inventory` | `inventory-web` | **SIMAS 241** — Sistem Informasi Manajemen Aset (aset, sirkulasi, approval) |
| `packages/ui` | `@241/ui` | Komponen UI shadcn-vue + util (`cn`) yang dipakai kedua app |
| `packages/shared` | `@241/shared` | Composables, utils, types, HTTP client — lintas app |
| `packages/platform` | `@241/platform` | Fitur platform bersama (auth, profile, dashboard, role, dll.) |
| `backend` | `backend` | API NestJS + Prisma — **bagian dari workspace ini** (lihat `backend/README.md`) |

> Backend kini **satu monorepo & satu git** dengan frontend (workspace pnpm yang sama).
> Ia tetap punya tooling sendiri (ESLint/Prettier bergaya Node/Nest, Prisma), jadi
> perintah quality-check backend dijalankan lewat filternya sendiri (lihat di bawah).

---

## Struktur Direktori

```text
241-apps/
├── apps/
│   ├── academic/               # aplikasi SIAKAD (academic-web)
│   │   └── src/
│   │       ├── app/            # entry: main.ts, App.vue, router & store providers
│   │       ├── components/
│   │       │   └── layout/     # komponen layout app-specific (AppSidebar, NavMain)
│   │       ├── config/         # menuConfig — navigasi khusus app
│   │       ├── features/
│   │       │   └── academic/   # CORE DOMAIN app ini (student, curriculum, dll.)
│   │       │                   # (fitur platform bersama ada di @241/platform)
│   │       ├── layouts/
│   │       └── style.css       # Tailwind v4 entry + theme tokens
│   └── inventory/              # aplikasi SIMAS (inventory-web), struktur sama
├── packages/
│   ├── ui/         (@241/ui)        # shadcn-vue primitives, komponen generik, cn()
│   ├── shared/     (@241/shared)    # composables, utils, types, api client
│   └── platform/   (@241/platform)  # fitur auth/profile/dashboard/role/… bersama
├── backend/                    # NestJS + Prisma (dalam workspace ini)
├── package.json                # root workspace (scripts + devDependencies hoisted)
├── pnpm-workspace.yaml         # daftar workspace: apps/* · packages/* · backend
├── tsconfig.base.json          # opsi compiler bersama
├── eslint.config.mjs           # ESLint flat config (dipakai semua app + packages)
├── eslint.typecheck.config.mjs # ESLint type-aware (strict) — dipakai `lint:strict`
├── .prettierrc / .prettierignore
└── .gitattributes              # normalisasi line ending → LF
```

### Kenapa monorepo?

Sebelumnya `academic` dan `inventory` adalah repo terpisah yang **menyalin** kode
`shared/`, `ui/`, dan fitur `platform/`. Salinan itu mulai berbeda diam-diam
(bug diperbaiki di satu app, tidak di app lain). Sekarang kode bersama hidup di
`packages/*` sebagai **satu sumber kebenaran**, dikonsumsi langsung sebagai source
TypeScript (tanpa build step) lewat alias `@/ui`, `@/shared`, `@/features/platform`.

---

## Prasyarat

- **Node.js** ≥ 20 (disarankan LTS terbaru)
- **pnpm** ≥ 9 — `npm i -g pnpm`

## Instalasi

Jalankan **sekali dari root** — pnpm akan menautkan semua workspace:

```bash
pnpm install
```

## Menjalankan (development)

```bash
pnpm dev:academic     # SIAKAD  → http://localhost:5173
pnpm dev:inventory    # SIMAS   → http://localhost:5173 (port lain jika bentrok)
```

Atau langsung per app:

```bash
pnpm --filter academic-web dev
pnpm --filter inventory-web dev
```

### Environment variable

Tiap app baca `VITE_API_BASE_URL`. Salin `apps/<app>/.env.example` → `apps/<app>/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Build & Quality Checks

Dari root (menyasar kedua app frontend — filter `*-web`):

```bash
pnpm build           # build produksi kedua app
pnpm typecheck       # vue-tsc kedua app
pnpm lint            # ESLint kedua app
pnpm lint:strict     # ESLint type-aware (strict) kedua app
pnpm format:check    # Prettier check kedua app
```

> Filter memakai nama paket (`*-web`), **bukan** path `./apps/*`. Filter path
> pnpm case-sensitive terhadap penulisan cwd, sehingga di Windows bisa diam-diam
> tidak cocok dengan paket apa pun (script "hijau" padahal tak menjalankan apa-apa).

Per app (mis. hanya inventory):

```bash
pnpm --filter inventory-web build
pnpm --filter inventory-web lint
pnpm --filter inventory-web lint:strict   # ESLint type-aware (strict)
pnpm --filter inventory-web validate      # format + lint + typecheck + lint:strict + build
```

Backend (tooling sendiri, jalankan lewat filternya):

```bash
pnpm --filter backend build          # nest build
pnpm --filter backend lint           # ESLint (Node/Nest)
pnpm --filter backend typecheck      # tsc --noEmit
pnpm --filter backend prisma:generate
```

> **Status `lint:strict`:** aturan type-aware ketat
> (`no-floating-promises`, `restrict-template-expressions`, `no-unsafe-*`, dll.).
> **Semuanya kini hijau** — kedua app frontend dan backend lolos `lint`,
> `lint:strict`, `typecheck`, `format:check`, dan `build`; test backend lolos
> penuh. Catatan: rule `@typescript-eslint/unbound-method` dimatikan di config
> `lint:strict` backend karena crash di ESLint 10 (bug upstream, bukan error
> kode); rule type-aware untuk file test & script `prisma/*` juga dilonggarkan
> sesuai praktik umum.

---

## Konvensi Arsitektur (WAJIB DIBACA)

Frontend memakai **Vue 3 Feature-Driven Architecture (Strict Domain)** — **1 domain = 1 feature**.

### Struktur internal tiap fitur

Berlaku untuk fitur di `apps/*/src/features/*` maupun `packages/platform/src/features/*`:

```text
feature-name/
├── api/            # HTTP ONLY (khusus domain terkait)
├── services/       # BUSINESS LOGIC
├── stores/         # STATE (Pinia)
├── composables/    # LOGIC reusable
├── components/     # UI internal khusus fitur
├── views/          # Halaman (opsional)
├── types/          # Type & interface khusus fitur
└── index.ts        # PUBLIC API — semua export lewat sini
```

### Aturan batas (boundary)

- App **hanya** boleh mengimpor package lewat alias publiknya: `@/ui`, `@/shared`,
  `@/features/platform/<fitur>`. Jangan menembus path internal package.
- Kode yang dipakai **dua app** → naikkan ke `packages/*`. Kode khusus satu app
  (mis. `menuConfig`, `AppSidebar`) → tetap di app.
- `@241/platform` boleh bergantung pada `@241/ui` & `@241/shared`, **tidak sebaliknya**.

### Branding per app

Fitur `auth` di `@241/platform` netral secara default dan dikonfigurasi tiap app
lewat `configureAuth()` di `apps/<app>/src/app/main.ts`:

```ts
import { configureAuth } from '@/features/platform/auth'

configureAuth({
  appTitle: 'SIMAS 241',
  appSubtitle: 'Sistem Informasi Manajemen Aset',
  logoAlt: 'SIMAS Logo',
  loginTitle: 'Masuk ke SIMAS',
})
```

---

## Menambah Komponen shadcn-vue

Komponen UI shadcn-vue kini tinggal di `packages/ui`, jadi jalankan CLI dari sana
(config: `packages/ui/components.json`):

```bash
pnpm --filter @241/ui dlx shadcn-vue@latest add <komponen>
```

> Setup monorepo shadcn-vue perlu divalidasi saat pertama kali `add` — lihat
> [dokumentasi resmi shadcn-vue](https://www.shadcn-vue.com/docs/components-json).

---

## Tech Stack

Vue 3 (Composition API + `<script setup>`) · TypeScript · Vite · Tailwind CSS v4 ·
shadcn-vue + Reka UI · Pinia · Vue Router · vee-validate + Zod · TanStack Vue Table ·
Lucide · Axios · FullCalendar. Backend: NestJS + Prisma (lihat `backend/README.md`).

---
*Dikelola untuk MTs Persis 241 Al-Ikhlash.*
