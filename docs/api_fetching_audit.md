# Audit Strategy API Fetching — Comprehensive Project Report

> **Catatan Audit**: Dokumen ini bersifat analisis murni tanpa melakukan perubahan kode (*zero code mutation*). Seluruh temuan bersumber dari pengujian dan verifikasi langsung terhadap struktur codebase Vue 3, Pinia Store, dan Axios API Layer pada project.

---

## A. Executive Summary

Berdasarkan audit menyeluruh terhadap 40+ views, composable, Pinia store, dan API service di dalam project (terutama modul `apps/academic/src` dan package `@241/platform` & `@241/master-data`), ditemukan bahwa **mekanisme API fetching saat ini 100% didasarkan pada manual lifecycle `onMounted` + Axios imperative call di Pinia Store / Composable, tanpa lapisan caching layer (seperti TanStack Query / Vue Query)**.

### Karakteristik Utama Arsitektur Fetching Saat Ini:
1. **Zero Client-Side Caching**: Data master yang jarang berubah (Tahun Ajaran, Semester, Mata Pelajaran, Status Kepegawaian, Jabatan, Agama, Jenis Kelamin, dll.) dipanggil ulang dari server secara *eager* setiap kali pengguna berpindah halaman atau membuka formulir.
2. **Eager Dialog Data Fetching**: Data pilihan dropdown untuk modal/dialog (misalnya daftar semua guru, semua mata pelajaran, semua siswa tersedia, semua jabatan) di-fetch di `onMounted` halaman utama, padahal modal tersebut belum tentu dibuka oleh pengguna.
3. **Duplicate Request Across Features**: Setiap modul (`student`, `teacher`, `classroom`, `teaching-assignment`, `attendance`, `curriculum-subject`) memuat API master data sendiri-sendiri tanpa *shared cache* Pinia global.
4. **Heavy Initial Page Load**: Halaman kompleks seperti `ClassroomManageView.vue` menjalankan hingga **8 API request sekaligus** di `onMounted`, termasuk mengambil 1.000 data siswa yang belum tentu dibutuhkan jika user hanya ingin melihat struktur kelas.

---

## B. Masalah Paling Kritis (Top Critical Bottlenecks)

| No | Lokasi File | Deskripsi Masalah Kritis | Dampak Performa / UX |
|---|---|---|---|
| 1 | `apps/academic/src/features/academic/classroom/views/ClassroomManageView.vue` | `onMounted` memanggil `fetchAvailableStudents()` (1.000 data siswa) & 7 API lain secara bersamaan. | Server terbeban fetching data masal siswa setiap kali halaman kelola kelas dibuka, meskipun user tidak mengeklik "Tambah Siswa". |
| 2 | `apps/academic/src/features/academic/student/composables/useStudentCreateForm.ts` & `useTeacherCreateForm.ts` | Mengambil data master (Grades, Classrooms, Occupations, EmploymentTypes, Positions) dengan `limit: 1000` langsung di `onMounted` halaman wizard. | Data master di-fetch sebelum user memasuki step 2/3/4 yang membutuhkan dropdown tersebut. |
| 3 | `apps/academic/src/features/academic/curriculum-subject/views/CurriculumSubjectView.vue` | `fetchReferenceData()` memanggil `/subjects?limit=1000` di `onMounted` halaman daftar mata pelajaran kurikulum. | 1.000 mata pelajaran di-load meskipun user hanya membaca daftar mapel kurikulum tanpa menambah mapel baru. |
| 4 | Seluruh Halaman List & Dialog (Master Data Reference Fetching) | Tidak ada `staleTime` atau caching layer untuk Master Data (Tahun Ajaran, Semester, Kelas, Guru, Mapel). | Setiap perpindahan rute (misal dari `/academic/classroom` ke `/academic/curriculum` lalu ke `/academic/teaching-assignment`) memicu request ulang data yang sama. |
| 5 | Auth & Application Bootstrap (`apps/academic/src/app/main.ts`) | `restoreSession()` dan `fetchSettings('ACADEMIC')` berjalan serial sebelum rute pertama dirender tanpa precaching role/permission. | Menambah waktu blank screen saat pertama kali aplikasi dibuka. |

---

## C. Tabel Inventory Audit API Fetching

Setiap pemanggilan API dikelompokkan ke dalam 6 kategori:
- **EAGER**: Diperlukan untuk render awal halaman (misal: data tabel utama).
- **LAZY**: Hanya diperlukan saat user membuka modal / memilih tab / menekan tombol.
- **PREFETCH**: Layak diambil lebih awal secara background tanpa mengganggu render awal.
- **CACHE/SHARED**: Data master global yang harus di-share lintas modul dengan caching policy.
- **MUTATION**: Operation POST/PATCH/DELETE yang dipicu aksi user.
- **REMOVE/REDESIGN**: Request redundant yang harus dihilangkan atau di-refactor bentuk fetching-nya.

| Location | Query/API | Current Behavior | Recommended Strategy | Priority | Reason |
|---|---|---|---|---|---|
| `main.ts` (L24, L30) | `authService.restoreSession()` & `useSettingsStore().fetchSettings()` | Restores session sequentially before mount; settings fire-and-forget. | **PREFETCH** | P1 | Settings bisa diprefetch bersamaan dengan session restore. |
| `ClassroomManageView.vue` (L200-215) | `fetchAvailableStudents()` | Dipanggil di `onMounted` utama dengan limit 1.000 data. | **LAZY** | P0 | Hanya dibutuhkan saat modal "Tambah Siswa ke Kelas" dibuka. |
| `ClassroomManageView.vue` (L200-215) | `fetchTeachers()`, `fetchGrades()`, `fetchAcademicYears()` | 8 API request berjalan sejajar di `onMounted`. | **CACHE/SHARED** | P1 | Referensi master ini seharusnya dibaca dari Query Cache / Shared Pinia Store. |
| `StudentCreateView.vue` / `useStudentCreateForm.ts` (L227) | `api.get('/grades')`, `classroomApi.getClassrooms()`, `occupationApi.getOccupations()` | Dipanggil bersamaan di `onMounted` saat Step 1 (Profil) dibuka. | **LAZY** / **CACHE/SHARED** | P1 | Grade/Classroom baru dipakai di Step 2 (Akademik), Occupation di Step 4 (Orang Tua). |
| `TeacherCreateView.vue` / `useTeacherCreateForm.ts` (L191) | `api.get('/employment-types')`, `teacherApi.getPositions()` | Dipanggil bersamaan di `onMounted` saat Step 1 dibuka. | **LAZY** / **CACHE/SHARED** | P1 | EmploymentType baru dipakai di Step 2, Position di Step 4. |
| `CurriculumSubjectView.vue` (L100-104) | `fetchReferenceData()` (`/subjects?limit=1000`) | Dipanggil di `onMounted` bersamaan dengan detail kurikulum & item list. | **LAZY** | P0 | Mengambil seluruh 1.000 mapel sekolah di halaman list utama, padahal hanya dipakai di dialog "Tambah Mapel". |
| `TeachingAssignmentView.vue` (L104) | `fetchFilterOptions()` (Classrooms, Teachers, Assignable Subjects) | Dipanggil di `onMounted` bersamaan dengan `fetchTeachingAssignments()`. | **CACHE/SHARED** | P1 | Filter options bisa diambil dari shared cache. |
| `TeachingAssignmentFormDialog.vue` (L68, L72) | `semesterApi.getSemesters()` | Dipanggil di `onMounted` dialog untuk mengisi dropdown semester. | **CACHE/SHARED** | P2 | Panggilan sudah tepat di dialog, tetapi perlu caching agar buka modal ke-2 kali tidak re-fetch. |
| `AttendanceView.vue` (L113-124) | `fetchFilterOptions()` (Classrooms, Semesters) | Dipanggil di `onMounted` halaman kehadiran. | **CACHE/SHARED** | P1 | Data kelas dan semester aktif idealnya dari shared active-context cache. |
| `RaporView.vue` | `fetchClasses()`, `fetchSemesters()`, `fetchStudents()` | Fetch serial/eager di `onMounted`. | **LAZY** / **EAGER** | P1 | Siswa baru di-fetch setelah Kelas & Semester dipilih. |
| `StudentScoreGradingView.vue` | `fetchSubjects()`, `fetchClassrooms()`, `fetchScores()` | Fetch di `onMounted` secara eager. | **LAZY** | P1 | Score list baru di-fetch ketika filter Mapel & Kelas sudah terpilih. |
| `GradeFormDialog.vue` (L96) | `academicYearApi.getAcademicYears()`, `curriculumApi.getCurricula()`, `getAssignments()` | Dipanggil via `Promise.all` di `onMounted` dialog. | **CACHE/SHARED** | P2 | Panggilan sudah tepat lazy di dialog, namun belum ada layer caching. |
| `MasterDataListView.vue` (L58) | `config.service.list()` | Dipanggil di `onMounted` setiap halaman Master Data. | **EAGER** / **CACHE** | P2 | Perlu query invalidation standar saat mutation (create/update/delete) berhasil. |

---

## D. Analisis Berdasarkan 10 Kategori Spesifik

### 1. Initial Page Load (Overloaded Page Loads)
- **Problem**: Beberapa halaman detail/manage (misal `ClassroomManageView.vue`, `StudentCreateView.vue`, `TeacherCreateView.vue`) memuat data dalam jumlah besar sekaligus di `onMounted`.
- **Contoh**: `ClassroomManageView.vue` mengeksekusi 8 panggilan API di `onMounted`, menyebabkan server dan jaringan memproses request `available-students` (1.000 record) saat user hanya ingin melihat wali kelas atau nama kelas.

### 2. Duplicate Requests Across Components & Pages
- **Problem**: Master data seperti **Tahun Ajaran (`/academic-years`)**, **Semester (`/semesters`)**, **Kelas (`/classrooms`)**, **Mata Pelajaran (`/subjects`)**, dan **Guru (`/teachers`)** di-fetch secara independen oleh setiap halaman/dialog.
- **Dampak**: Navigasi pengguna dari `Kelas` → `Kurikulum` → `Penugasan Mengajar` → `Kehadiran` melakukan fetch ulang hingga 4x untuk data master yang sama persis dalam 1 sesi login.

### 3. Sequential Requests (Unnecessary Chaining)
- **Problem**: Di beberapa tempat, request dipanggil secara `await` beruntun daripada diparalelkan dengan `Promise.all`.
- **Contoh**: Di `ClassroomManageView.vue` (L204-210), data semester di-fetch dulu, baru setelah selesai dipanggil `fetchClassroomEnrollments` dan `fetchClassroomStructure` secara bertahap.

### 4. Over-fetching (Excess Payload / Premature Fetch)
- **Problem**: Penggunaan `limit: 1000` (`PAGINATION.REFERENCE_LIMIT`) tanpa filter pada dropdown master data.
- **Contoh**: Pada dialog penambahan siswa ke kelas, seluruh daftar siswa tanpa kelas di-fetch sekaligus (1.000 item), bukan menggunakan paginasi server-side atau pencarian berbasis input (combobox search on type).

### 5. Under-fetching & N+1 Pattern
- **Problem**: Saat ini backend menyediakan beberapa endpoint bulk (seperti `/curriculum-subjects/bulk` dan `/teaching-assignments`), namun di beberapa tempat frontend masih melakukan iterasi request serial jika endpoint bulk belum dimanfaatkan.

### 6. Modal / Dialog Data Fetching
- **Problem (Eager Fetching)**: `CurriculumSubjectView.vue` memanggil `subjectApi.getSubjects({ limit: 1000 })` di halaman utama, bukan di dalam `AddCurriculumSubjectDialog.vue`.
- **Rekomendasi**: Seluruh referensi yang hanya dipakai di modal (misalnya list pekerjaan orang tua, list mapel yang bisa ditambah, list siswa yang bisa di-enroll) **harus di-fetch di dalam modal saat `open === true`**.

### 7. Tabs Data Fetching
- **Problem**: Pada halaman yang memiliki tab (seperti `AttendanceView.vue` yang memiliki tab "Input Kehadiran" dan "Rekapitulasi"), data rekapitulasi atau data input di-evaluasi bersamaan di watcher awal.
- **Rekomendasi**: Fetch data tab hanya ketika tab tersebut sedang aktif (`activeTab === 'recap'`).

### 8. Lookup / Master Data Strategy

Tabel Strategi Caching Master Data yang Direkomendasikan:

| Master Data | Caching Strategy | Recommended `staleTime` | Scope |
|---|---|---|---|
| Academic Years & Semesters | **CACHE/SHARED** (TanStack Query / Global Store) | 30 Menit | Global (Seluruh App) |
| Position & Employment Types | **CACHE/SHARED** | 60 Menit | Global |
| Religions, Blood Types, Occupations | **CACHE/SHARED** | 24 Jam | Global |
| Subjects List | **CACHE/SHARED** (Filtered by Active Curriculum) | 10 Menit | Per Sesi / Feature |
| Classrooms List | **CACHE/SHARED** | 5 Menit | Feature Academic |
| Teachers List | **CACHE/SHARED** | 5 Menit | Feature Academic |

### 9. Query Cache / TanStack Query Audit
- **Status Saat Ini**: TanStack Query **belum diimplementasikan** di frontend. Seluruh fetching dilakukan dengan Pinia + raw Axios (`api.get`).
- **Resiko Arsitektur**:
  - `staleTime` & `gcTime`: 0 (setiap kompoen mount pasti refetch).
  - `queryKey`: Belum ada konvensi query key terstruktur.
  - `invalidation`: Dilakukan manual secara imperatif (`await fetchList()`) setelah mutation berhasil, yang rawan terlewat.

### 10. Architecture & Fetching Convention

#### Rekomendasi Arsitektur Standar (TanStack Query / Vue Query):
1. **Gunakan TanStack Query (`@tanstack/vue-query`)** sebagai lapisan kueri data async.
2. **Pisahkan Query Keys ke dalam Constant Factory**:
   ```ts
   export const curriculumKeys = {
     all: ['curricula'] as const,
     lists: () => [...curriculumKeys.all, 'list'] as const,
     list: (filters: string) => [...curriculumKeys.lists(), { filters }] as const,
     details: () => [...curriculumKeys.all, 'detail'] as const,
     detail: (id: string) => [...curriculumKeys.details(), id] as const,
   }
   ```
3. **Lazy Modal Pattern**: Komponen dialog hanya membaca query dengan `enabled: computed(() => props.open)`.

---

## E. Rencana Perbaikan Berdasarkan Prioritas

### 🔴 P0 — Harubus Diperbaiki (High Performance Impact / Critical Overhead)
1. **Lazy-load `fetchAvailableStudents` di `ClassroomManageView.vue`**: Pindahkan pemanggilan 1.000 data siswa dari `onMounted` halaman utama ke dalam `AddStudentDialog.vue` (hanya dipanggil saat dialog dibuka).
2. **Lazy-load `fetchReferenceData` di `CurriculumSubjectView.vue`**: Pindahkan fetch 1.000 mapel dari `onMounted` ke `AddCurriculumSubjectDialog.vue`.

### 🟡 P1 — Sebaiknya Diperbaiki (UX & Network Optimization)
1. **Implementasi Shared Master Data Cache / Vue Query**: Pasang `@tanstack/vue-query` untuk Master Data (Tahun Ajaran, Semester, Kelas, Guru, Mapel) dengan `staleTime: 5 - 30 menit` untuk menghentikan request berulang saat navigasi rute.
2. **Lazy Step Fetching pada Multi-Step Wizard**: Pada `StudentCreateView` dan `TeacherCreateView`, fetch data pilihan (Pekerjaan, Jabatan, Status Kepegawaian) hanya saat user tiba di langkah wizard terkait.
3. **Lazy Tab Fetching di `AttendanceView.vue`**: Pastikan data Rekapitulasi Kehadiran hanya di-fetch jika tab "Rekapitulasi" sedang aktif.

### 🟢 P2 — Optimasi (Code Quality & Maintainability)
1. **Standardisasi Query Invalidation pada Mutation**: Ganti pemanggilan imperatif `await fetchList()` secara manual dengan automatical query invalidation via `queryClient.invalidateQueries()`.
2. **Form Dialog Reset & Pre-fill Optimization**: Pastikan dialog reuse data dari cache parent alih-alih melakukan `getById` ulang jika data item lengkap sudah tersedia di row tabel.

---

## F. Contoh Pattern / Code Convention yang Direkomendasikan

### 1. Pattern Lazy Dialog Fetching (Vue Query / Composable)

```vue
<!-- AddStudentDialog.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { classroomApi } from '../api/classroomApi'

const props = defineProps<{ open: boolean; classroomId: string }>()

// Data HANYA di-fetch jika dialog terbuka (enabled = props.open)
const { data: availableStudents, isLoading } = useQuery({
  queryKey: ['classrooms', 'available-students', props.classroomId],
  queryFn: () => classroomApi.getAvailableStudents(props.classroomId),
  enabled: computed(() => props.open),
  staleTime: 1000 * 60 * 2, // 2 menit cache
})
</script>
```

### 2. Pattern Global Master Data Caching

```ts
// composables/useMasterDataQuery.ts
import { useQuery } from '@tanstack/vue-query'
import { academicYearApi } from '@/features/academic/academic-year'

export function useAcademicYearsQuery() {
  return useQuery({
    queryKey: ['master-data', 'academic-years'],
    queryFn: async () => {
      const res = await academicYearApi.getAcademicYears({ limit: 100 })
      return res.data?.data ?? []
    },
    staleTime: 1000 * 60 * 30, // 30 Menit tidak akan re-fetch saat navigasi
  })
}
```

---

## G. Hal yang Jangan Dilakukan Lagi (Anti-Patterns to Avoid)

1. ❌ **Jangan memanggil API master data masal (limit 1000) di `onMounted` view utama** jika data tersebut hanya dibutuhkan oleh modal/dialog tertentu.
2. ❌ **Jangan melakukan manual re-fetch tanpa caching** untuk data statis/referensi yang jarang berubah.
3. ❌ **Jangan mengeksekusi request sekuensial (`await` beruntun)** untuk data yang independen; gunakan `Promise.all` atau parallel queries.
4. ❌ **Jangan mengabaikan state tab yang aktif** saat men-trigger watcher data fetching.
