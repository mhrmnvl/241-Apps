# Fase 3 — Split Bloated Repositories & Standardisasi Folder Structure

## Tujuan

1. Split repository files yang >300 lines menjadi focused sub-repositories
2. Standardisasi semua concrete repository ke folder `infrastructure/persistence/`

## Prinsip

- **Clean Code (SRP)**: "Classes should have a single responsibility" — sebuah repository yang 458 lines punya terlalu banyak responsibility
- **Clean Architecture**: Infrastructure implementations harus berada di `infrastructure/persistence/`
- **nestjs-modular-monolith**: Consistent module structure across all bounded contexts

---

## Part A: Split Bloated Repositories

### Target Files

| # | File | Lines | Module |
|---|---|---|---|
| 1 | `prisma-admission-application.repository.ts` | 458 | `admission` |
| 2 | `prisma-student.repository.ts` | 400 | `academic/student` |
| 3 | `prisma-admission-applicant.repository.ts` | 375 | `admission` |
| 4 | `prisma-attendance.repository.ts` | 369 | `academic/attendance` |
| 5 | `prisma-circulation.repository.ts` | 333 | `inventory/circulation` |

### Strategi Split

Pecah berdasarkan **aggregate boundaries** atau **operation type**. Setiap sub-repository mendapat interface-nya sendiri.

#### 1. `prisma-admission-application.repository.ts` (458 lines)

**Langkah**:
1. Buka file dan identifikasi method groups berdasarkan aggregate:
   - Application CRUD methods → `IAdmissionApplicationRepository`
   - Document-related methods → `IAdmissionDocumentRepository`
   - Status transition methods → bisa tetap di `IAdmissionApplicationRepository` atau pisah ke service
2. Buat interface baru di `domain/interfaces/` untuk setiap sub-repository
3. Split concrete implementation ke file terpisah:
   ```
   admission/infrastructure/persistence/
   ├── prisma-admission-application.repository.ts   (CRUD + status)
   └── prisma-admission-document.repository.ts      (document operations)
   ```
4. Register semua sub-repositories di `admission.module.ts`
5. Update use-cases yang perlu inject sub-repository baru

#### 2. `prisma-student.repository.ts` (400 lines)

**Langkah**:
1. Identifikasi method groups:
   - Student CRUD → `IStudentRepository`
   - Student account/user operations (toggle active, soft delete) → bisa tetap atau pisah
   - Export operations → `IStudentExportRepository` (atau query handler)
   - Bulk import → sudah terpisah di `ExcelStudentParser`
2. Split:
   ```
   academic/student/infrastructure/persistence/
   ├── prisma-student.repository.ts          (CRUD + status)
   └── prisma-student-export.repository.ts   (export queries)
   ```
3. Atau, jika export hanya 1-2 methods, biarkan di `IStudentRepository` tapi refactor internal helpers

#### 3. `prisma-admission-applicant.repository.ts` (375 lines)

**Langkah**:
1. Identifikasi method groups:
   - Applicant profile CRUD
   - Notification operations → sudah ada `createNotification`
   - Payment/document operations
2. Split jika ada aggregate boundary yang jelas

#### 4. `prisma-attendance.repository.ts` (369 lines)

**Langkah**:
1. Identifikasi method groups:
   - Attendance CRUD
   - Attendance report/summary queries
   - Bulk attendance operations
2. Split:
   ```
   academic/attendance/infrastructure/persistence/
   ├── prisma-attendance.repository.ts         (CRUD + bulk)
   └── prisma-attendance-report.repository.ts  (report/summary queries)
   ```

#### 5. `prisma-circulation.repository.ts` (333 lines)

**Langkah**:
1. Identifikasi method groups:
   - Circulation CRUD (borrow/return)
   - Circulation report queries
   - Circulation status operations
2. Split berdasarkan aggregate

### Panduan Split

**Kapan split?**
- File > 300 lines
- Method groups yang jelas berbeda responsibility
- Ada aggregate boundary yang distinct

**Kapan JANGAN split?**
- Methods saling tightly coupled dan share internal state/helpers
- Splitting justru menambah complexity tanpa benefit
- File < 200 lines

**Threshold target**: Setiap repository file idealnya < 200 lines.

---

## Part B: Standardisasi Folder Structure

### Masalah

Saat ini ada **2 pattern** yang bercampur:

| Pattern | Lokasi | Contoh |
|---|---|---|
| ✅ **Standard** | `infrastructure/persistence/prisma-xxx.repository.ts` | `academic/student`, `inventory/asset` |
| ❌ **Legacy** | `repositories/xxx.repository.ts` | `platform/file`, `platform/settings` |

Beberapa `repositories/*.repository.ts` adalah **re-export files** yang mengarah ke `infrastructure/persistence/`:
```typescript
// repositories/subject.repository.ts (re-export)
export { PrismaSubjectRepository as SubjectRepository } from '../infrastructure/persistence/prisma-subject.repository.js';
```

### Target State

Semua modules harus mengikuti:
```
module-name/
├── domain/
│   ├── entities/           ← domain types (Fase 2)
│   ├── enums/              ← domain enums (Fase 2)
│   └── interfaces/
│       └── xxx-repository.interface.ts
├── infrastructure/
│   └── persistence/
│       └── prisma-xxx.repository.ts
├── presentation/
│   └── xxx.controller.ts
├── use-cases/
│   └── xxx.use-case.ts
├── dto/
│   ├── request/
│   └── response/
└── xxx.module.ts
```

### Modules yang Perlu Distandarisasi

#### Re-export files yang bisa dihapus setelah Fase 1

Setelah Fase 1 selesai (semua concrete repos pindah ke `infrastructure/persistence/`), file re-export di `repositories/` bisa dihapus.

**Files to delete** (hanya yang pure re-exports):

```
academic/subject/repositories/subject.repository.ts
academic/student/repositories/student.repository.ts
academic/student/repositories/student-parent.repository.ts
academic/student/repositories/student-address.repository.ts
academic/teacher/repositories/teacher.repository.ts
academic/teacher/repositories/teacher-position.repository.ts
academic/teacher/repositories/teacher-address.repository.ts
academic/teaching-assignment/repositories/teaching-assignment.repository.ts
academic/semester/repositories/semester.repository.ts
academic/semester/repositories/promotion.repository.ts
academic/semester/repositories/rollover.repository.ts
academic/schedule/repositories/schedule.repository.ts
academic/schedule/repositories/time-slot.repository.ts
academic/report-card/repositories/report-card.repository.ts
academic/parent/repositories/parent.repository.ts
academic/graduation/repositories/graduation.repository.ts
academic/grade/repositories/grade.repository.ts
academic/enrollment/repositories/enrollment.repository.ts
academic/curriculum/repositories/curriculum.repository.ts
academic/curriculum/repositories/curriculum-subject.repository.ts
academic/classroom/repositories/classroom.repository.ts
academic/classroom/repositories/classroom-structures.repository.ts
academic/classroom/repositories/classroom-supervisors.repository.ts
academic/calendar/repositories/academic-calendar.repository.ts
academic/calendar/repositories/events.repository.ts
academic/assessment/repositories/assessment-items.repository.ts
academic/assessment/repositories/student-scores.repository.ts
academic/attendance/repositories/attendance.repository.ts
academic/academic-year/repositories/academic-year.repository.ts
academic/master-data/academic-calendar-type/repositories/academic-calendar-type.repository.ts
platform/access-control/role/repositories/role.repository.ts
platform/access-control/permission/repositories/permission.repository.ts
platform/announcement/repositories/announcement.repository.ts
platform/profile/repositories/profile.repository.ts
platform/profile/repositories/profile-address.repository.ts
platform/profile/repositories/profile-social-media.repository.ts
platform/school-unit/repositories/school-unit.repository.ts
platform/school-unit/repositories/school-unit-address.repository.ts
platform/school-unit/repositories/school-unit-social-media.repository.ts
platform/school-unit/repositories/school-unit-types.repository.ts
platform/master-data/blood-type/repositories/blood-type.repository.ts
platform/master-data/religion/repositories/religion.repository.ts
platform/master-data/achievement-type/repositories/achievement-type.repository.ts
platform/user/repositories/user.repository.ts
```

**⚠️ Sebelum menghapus**, cek apakah ada import dari file lain yang mengarah ke re-export ini:
```bash
grep -r "from.*repositories/subject.repository" src/
```
Jika ada, update import path dulu ke `infrastructure/persistence/` atau `domain/interfaces/`.

#### Interface folder inconsistency

Beberapa modules meletakkan interfaces di `interfaces/` (flat), bukan `domain/interfaces/`:

```
# Yang perlu dipindahkan ke domain/interfaces/:
academic/master-data/employment-type/interfaces/  → domain/interfaces/
academic/master-data/occupation/interfaces/        → domain/interfaces/
academic/master-data/position/interfaces/          → domain/interfaces/
academic/master-data/position-category/interfaces/ → domain/interfaces/
platform/master-data/education/interfaces/         → domain/interfaces/
platform/master-data/social-media/interfaces/      → domain/interfaces/
```

---

## Urutan Pengerjaan

> [!IMPORTANT]
> Fase 3 sebaiknya dikerjakan **setelah** Fase 1 dan Fase 2 selesai, karena:
> - Fase 1 memindahkan concrete repos ke `infrastructure/persistence/`
> - Fase 2 menghilangkan Prisma dari interfaces
> - Fase 3 tinggal split dan cleanup

### Step-by-step:
1. Split 5 bloated repositories (Part A)
2. Hapus re-export files di `repositories/` (Part B)
3. Standardisasi interface folder placement (Part B)
4. Verify: lint, build, test

---

## Checklist Verifikasi

- [ ] Tidak ada repository file > 300 lines
- [ ] Tidak ada folder `repositories/` yang berisi concrete implementations
- [ ] Semua interfaces berada di `domain/interfaces/`
- [ ] Semua concrete repos berada di `infrastructure/persistence/`
- [ ] `pnpm --filter backend run lint:strict` → 0 errors
- [ ] `pnpm --filter backend run build` → 0 errors
- [ ] `pnpm --filter backend run test` → semua pass

---

## Estimasi Effort

| Task | Effort |
|---|---|
| Split 5 bloated repos | 4-6 jam |
| Hapus re-export files + update imports | 3-4 jam |
| Standardisasi interface folders | 1-2 jam |
| **Total** | **8-12 jam** |
