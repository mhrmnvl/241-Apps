# Fase 2 — Pindahkan Prisma Query Artifacts dari Domain ke Infrastructure

## Tujuan

Menghilangkan dependency `@prisma/client` dari semua `domain/interfaces/*.interface.ts` files.
Memindahkan `INCLUDE` constants, `Prisma.XxxGetPayload` types, dan Prisma enums ke infrastructure layer
atau domain entities murni.

## Prinsip (Opsi B — Strict Clean Architecture)

> "Nothing in an inner circle can know anything about an outer circle."

Saat ini, `domain/interfaces/` files mengimport:
- `Prisma` namespace (untuk `Prisma.SubjectInclude`, `Prisma.SubjectGetPayload`, dll.)
- Prisma generated model types (`Subject`, `User`, `Student`, dll.)
- Prisma enums (`StudentStatus`, `AppKey`, `Day`, dll.)

Semua ini = dependency ke ORM framework = outer circle. Harus dihilangkan dari domain layer.

## Strategi

### 2A. Pindahkan INCLUDE Constants ke Infrastructure

**Sebelum** (di `domain/interfaces/subject-repository.interface.ts`):
```typescript
import { Prisma, Subject } from '@prisma/client';

export const SUBJECT_LIST_INCLUDE = {
  teachingAssignments: {
    include: { teacher: { include: { user: { include: { profile: true } } } } },
  },
} satisfies Prisma.SubjectInclude;

export type SubjectWithDetails = Prisma.SubjectGetPayload<{
  include: typeof SUBJECT_LIST_INCLUDE;
}>;
```

**Sesudah**:

1. Pindahkan `INCLUDE` + `GetPayload` type ke `infrastructure/persistence/prisma-subject.includes.ts`:
   ```typescript
   import { Prisma } from '@prisma/client';

   export const SUBJECT_LIST_INCLUDE = {
     teachingAssignments: {
       include: { teacher: { include: { user: { include: { profile: true } } } } },
     },
   } satisfies Prisma.SubjectInclude;

   export type SubjectWithDetails = Prisma.SubjectGetPayload<{
     include: typeof SUBJECT_LIST_INCLUDE;
   }>;
   ```

2. Di `domain/interfaces/subject-repository.interface.ts`, definisikan domain type:
   ```typescript
   // Domain type — tidak tahu Prisma
   export interface SubjectWithDetails {
     id: string;
     name: string;
     code: string;
     // ... flatten fields yang dipakai oleh use-cases/controllers
     teachingAssignments: Array<{
       id: string;
       teacher: {
         id: string;
         user: { id: string; profile: { name: string } | null } | null;
       };
     }>;
   }
   ```

3. Di `infrastructure/persistence/prisma-subject.repository.ts`, implementasi return sesuai domain type.
   Karena Prisma `GetPayload` type biasanya _superset_ dari domain type, ini biasanya langsung compatible.

### 2B. Buat Domain Entities/Types untuk Prisma Models

Untuk setiap Prisma model yang dipakai di interface, buat domain type di `domain/entities/`:

```
module/
└── domain/
    ├── entities/
    │   ├── subject.entity.ts          ← plain TypeScript interface
    │   └── subject-with-details.ts    ← derived type untuk query results
    └── interfaces/
        └── subject-repository.interface.ts  ← hanya import dari ../entities/
```

**Contoh** `domain/entities/subject.entity.ts`:
```typescript
export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  curriculumId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### 2C. Buat Domain Enums untuk Prisma Enums

Untuk setiap Prisma enum yang dipakai di domain interface, buat domain enum:

```typescript
// domain/enums/student-status.enum.ts
export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED',
  DROPPED_OUT = 'DROPPED_OUT',
}
```

Di infrastructure, map Prisma enum ↔ domain enum (biasanya identical, jadi tidak perlu mapper).

---

## Daftar Files yang Harus Diubah

### Domain Interfaces dengan `@prisma/client` imports (60+ files)

Berikut files yang mengimport dari `@prisma/client` dan perlu di-refactor:

#### Academic Modules

| # | Interface File | Prisma Imports | Action |
|---|---|---|---|
| 1 | `academic/subject/domain/interfaces/subject-repository.interface.ts` | `Prisma, Subject` + `satisfies Prisma.SubjectInclude` | Buat `domain/entities/subject.entity.ts`, pindahkan INCLUDE |
| 2 | `academic/student/domain/interfaces/student-repository.interface.ts` | `Prisma, Student, User, Profile, StudentStatus, Address` + `satisfies Prisma.StudentInclude` | Buat entities + domain enums |
| 3 | `academic/teacher/domain/interfaces/teacher-repository.interface.ts` | `Prisma, Teacher, User, Profile` + 2x `satisfies` | Buat entities, pindahkan INCLUDEs |
| 4 | `academic/teacher/domain/interfaces/teacher-position-repository.interface.ts` | `Position, Prisma, TeacherPosition` + `satisfies` | Buat entities |
| 5 | `academic/teacher/domain/interfaces/teacher-address-repository.interface.ts` | `Address` | Buat `Address` entity |
| 6 | `academic/student/domain/interfaces/student-parent-repository.interface.ts` | `Prisma, StudentParent` + `satisfies` | Buat entities |
| 7 | `academic/student/domain/interfaces/student-address-repository.interface.ts` | `Address, Prisma` | Share `Address` entity |
| 8 | `academic/semester/domain/interfaces/semester-repository.interface.ts` | `Prisma, Semester, SemesterType` + `satisfies` | Buat entities |
| 9 | `academic/semester/domain/interfaces/rollover-repository.interface.ts` | 6+ Prisma types + `satisfies` | Buat entities |
| 10 | `academic/semester/domain/interfaces/promotion-repository.interface.ts` | `Prisma` + 3x `satisfies` | Buat entities |
| 11 | `academic/schedule/domain/interfaces/schedule-repository.interface.ts` | `Day, Prisma, Schedule` + `satisfies` | Buat entities + `Day` enum |
| 12 | `academic/schedule/domain/interfaces/time-slot-repository.interface.ts` | `Prisma, TimeSlot, TimeSlotType` + `satisfies` | Buat entities |
| 13 | `academic/teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.ts` | `Prisma, TeachingAssignment` + `satisfies` | Buat entities |
| 14 | `academic/report-card/domain/interfaces/report-card-repository.interface.ts` | `Prisma, ReportCard` + `satisfies` | Buat entities |
| 15 | `academic/parent/domain/interfaces/parent-repository.interface.ts` | `Occupation, Parent, Prisma` + 3x `satisfies` | Buat entities |
| 16 | `academic/graduation/domain/interfaces/graduation-repository.interface.ts` | `Prisma, StudentGraduation` + `satisfies` | Buat entities |
| 17 | `academic/enrollment/domain/interfaces/enrollment-repository.interface.ts` | multiple + `satisfies` | Buat entities |
| 18 | `academic/grade/domain/interfaces/grade-academic-year-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 19 | `academic/curriculum/domain/interfaces/curriculum-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 20 | `academic/curriculum/domain/interfaces/curriculum-subject-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 21 | `academic/classroom/domain/interfaces/classroom-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 22 | `academic/classroom/domain/interfaces/classroom-supervisors-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 23 | `academic/classroom/domain/interfaces/classroom-structures-repository.interface.ts` | Prisma + 2x `satisfies` | Buat entities |
| 24 | `academic/calendar/domain/interfaces/events-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 25 | `academic/calendar/domain/interfaces/academic-calendar-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 26 | `academic/assessment/domain/interfaces/assessment-items-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 27 | `academic/assessment/domain/interfaces/student-scores-repository.interface.ts` | Prisma + 2x `satisfies` | Buat entities |
| 28 | `academic/attendance/domain/interfaces/attendance-repository.interface.ts` | Prisma + `satisfies` | Buat entities |
| 29 | `academic/master-data/semester-type/domain/interfaces/semester-type-repository.interface.ts` | `SemesterType, Prisma` | Buat entity |
| 30 | `academic/academic-year/domain/interfaces/academic-year-repository.interface.ts` | Prisma + `satisfies` | Buat entities |

#### Platform Modules

| # | Interface File | Prisma Imports | Action |
|---|---|---|---|
| 31 | `platform/user/domain/interfaces/user-repository.interface.ts` | `User, Prisma` + `satisfies` | Buat entities |
| 32 | `platform/profile/domain/interfaces/profile-repository.interface.ts` | `Profile, Prisma` + 3x `satisfies` | Buat entities |
| 33 | `platform/profile/domain/interfaces/profile-address-repository.interface.ts` | `Address, Student, Teacher, Prisma` + `satisfies` | Buat entities |
| 34 | `platform/profile/domain/interfaces/profile-social-media-repository.interface.ts` | `ProfileSocialMedia, Prisma` + `satisfies` | Buat entities |
| 35 | `platform/school-unit/domain/interfaces/school-unit-repository.interface.ts` | `Prisma` + `satisfies` | Buat entities |
| 36 | `platform/school-unit/domain/interfaces/school-unit-types-repository.interface.ts` | `SchoolUnitType, Prisma` | Buat entity |
| 37 | `platform/school-unit/domain/interfaces/school-unit-address-repository.interface.ts` | `Address, Prisma` + `satisfies` | Buat entities |
| 38 | `platform/school-unit/domain/interfaces/school-unit-social-media-repository.interface.ts` | `SchoolUnitSocialMedia, Prisma` + `satisfies` | Buat entities |
| 39 | `platform/auth/domain/interfaces/auth-repository.interface.ts` | `User, AuthSession, PasswordResetToken, Prisma` | Buat entities |
| 40 | `platform/announcement/domain/interfaces/announcement-repository.interface.ts` | `Announcement, Prisma` + `satisfies` | Buat entities |
| 41 | `platform/access-control/role/domain/interfaces/role-repository.interface.ts` | `Permission, Role, UserRole, Prisma` | Buat entities |
| 42 | `platform/access-control/permission/domain/interfaces/permission-repository.interface.ts` | `Permission, RolePermission, Prisma` | Buat entities |
| 43 | `platform/master-data/blood-type/domain/interfaces/blood-type-repository.interface.ts` | `BloodType, Prisma` | Buat entity |
| 44 | `platform/master-data/religion/domain/interfaces/religion-repository.interface.ts` | `Religion, Prisma` | Buat entity |
| 45 | `platform/master-data/achievement-type/domain/interfaces/achievement-type-repository.interface.ts` | `AchievementType, Prisma` | Buat entity |

#### Inventory Modules

| # | Interface File | Prisma Imports | Action |
|---|---|---|---|
| 46 | `inventory/asset/domain/interfaces/asset-repository.interface.ts` | `InventoryAsset, Prisma` | Buat entity |
| 47 | `inventory/asset/domain/interfaces/asset-unit-repository.interface.ts` | `InventoryAssetUnit, Prisma` | Buat entity |
| 48 | `inventory/circulation/domain/interfaces/circulation-repository.interface.ts` | 6+ types | Buat entities |
| 49 | `inventory/approval/domain/interfaces/approval-repository.interface.ts` | 6+ types | Buat entities |
| 50 | `inventory/master-data/*/domain/interfaces/*.interface.ts` (5 files) | Various | Buat entities |

#### Admission Modules

| # | Interface File | Prisma Imports | Action |
|---|---|---|---|
| 51 | `admission/domain/interfaces/admission-applicant-repository.interface.ts` | 9+ types | Buat entities |
| 52 | `admission/domain/interfaces/admission-application-repository.interface.ts` | 8+ types | Buat entities |
| 53 | `admission/domain/interfaces/admission-wave-repository.interface.ts` | `AdmissionWave, Prisma` | Buat entity |
| 54 | `admission/domain/interfaces/admission-announcement-repository.interface.ts` | Types | Buat entity |

---

## Workflow per Module

Untuk setiap module, ikuti langkah berikut:

### Step 1: Identifikasi Prisma types yang digunakan di interface
```bash
# Contoh untuk subject module
grep "from '@prisma/client'" src/academic/subject/domain/interfaces/*.ts
```

### Step 2: Buat `domain/entities/` untuk setiap Prisma model
- Salin field definitions dari Prisma schema (`prisma/schema.prisma`)
- Buat plain TypeScript interface
- Untuk nested `WithDetails` types, definisikan sebagai interface dengan nested objects

### Step 3: Buat `domain/enums/` untuk Prisma enums
- Salin enum values dari Prisma schema
- Buat TypeScript enum di domain layer

### Step 4: Pindahkan INCLUDE constants
- Dari `domain/interfaces/xxx-repository.interface.ts`
- Ke `infrastructure/persistence/prisma-xxx.includes.ts` (atau langsung di `prisma-xxx.repository.ts`)

### Step 5: Update interface imports
- Ganti `from '@prisma/client'` → `from '../entities/xxx.entity.js'`
- Ganti `Prisma.XxxGetPayload<...>` → domain interface

### Step 6: Update infrastructure imports
- `prisma-xxx.repository.ts` tetap boleh import `@prisma/client`
- Pastikan return types compatible dengan domain interface

### Step 7: Update use-cases imports
- Semua use-cases import types dari `domain/interfaces/` atau `domain/entities/`
- Bukan dari `@prisma/client` langsung

---

## Shared Domain Types

Beberapa types digunakan di banyak module. Buat di `shared/domain/entities/`:

```
shared/
└── domain/
    ├── entities/
    │   ├── address.entity.ts        ← Address type (used by student, teacher, parent, school-unit, profile)
    │   └── user.entity.ts           ← User type (used by student, teacher, auth, profile)
    └── enums/
        ├── student-status.enum.ts
        ├── enrollment-status.enum.ts
        └── day.enum.ts
```

---

## Estimasi Effort

| Kategori | Jumlah Files | Effort per File | Total |
|---|---|---|---|
| Domain entities baru | ~40-50 | 10-15 min | 7-12 jam |
| Domain enums baru | ~10 | 5 min | ~1 jam |
| Interface refactor | ~55 | 15-20 min | 14-18 jam |
| Infrastructure INCLUDE moves | ~45 | 5 min | ~4 jam |
| Use-case import updates | ~100+ | 5 min | ~8 jam |

**Total estimasi: 34-43 jam kerja**

> ⚠️ **Ini adalah refactor terbesar.** Disarankan kerjakan per bounded context:
> 1. `shared/domain/` (entities + enums yang di-share)
> 2. `platform/` modules
> 3. `academic/` modules
> 4. `inventory/` modules
> 5. `admission/` modules

---

## Checklist Verifikasi

- [ ] `grep -r "from '@prisma/client'" src/**/domain/**/*.ts` → **0 results**
- [ ] `grep -r "satisfies Prisma" src/**/domain/**/*.ts` → **0 results**
- [ ] `pnpm --filter backend run build` → 0 errors
- [ ] `pnpm --filter backend run test` → semua pass
- [ ] Semua use-cases hanya import dari `domain/` folder
