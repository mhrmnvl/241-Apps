# Plan: Fix Arsitektur Backend — Dari Audit Fase 1 & 2

> **Target Audience**: Junior programmer yang sudah familiar dengan NestJS dan TypeScript.
>
> **Tujuan**: Memperbaiki semua masalah arsitektur agar codebase bersih, konsisten, dan lulus `lint:strict`.

---

## Gambaran Besar

Saat ini codebase punya **4 masalah utama** yang harus diperbaiki **berurutan** (jangan loncat):

```
Tahap 1: Hapus file-file "perantara" yang tidak perlu (repositories/, interfaces/)
    ↓
Tahap 2: Perbaiki arah import domain — jangan import dari infrastructure
    ↓
Tahap 3: Ganti semua `any` dengan tipe domain yang jelas
    ↓
Tahap 4: Fix lint:strict sampai 0 error
```

> ⚠️ **PENTING**: Setiap tahap HARUS di-commit terpisah dan diverifikasi dengan `pnpm --filter backend run typecheck && pnpm --filter backend run build` sebelum lanjut ke tahap berikutnya.

---

## Tahap 1: Hapus File Perantara (Re-Export)

### Apa masalahnya?

Ada **~58 file** di folder `repositories/` dan **~8 file** di folder `interfaces/` (bukan `domain/interfaces/`) yang isinya hanya re-export:

```typescript
// ❌ File ini TIDAK PUNYA logic — hanya redirect
// repositories/profile.repository.ts
export { PrismaProfileRepository as ProfileRepository } from '../infrastructure/persistence/prisma-profile.repository.js';
export { PROFILE_INCLUDE, type ProfileWithDetails } from '../infrastructure/persistence/prisma-profile.includes.js';
```

File-file ini membuat use-case mengimport **concrete class** (tanpa sadar), bukan abstract interface.

### Apa yang harus dilakukan?

#### Step 1.1: Update import di use-cases & spec files

Untuk **setiap** use-case yang import dari `'../repositories/...'`:

```diff
// SEBELUM (salah)
-import { AnnouncementRepository } from '../repositories/announcement.repository.js';
+import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';

// Di constructor:
-constructor(private readonly repo: AnnouncementRepository) {}
+constructor(private readonly repo: IAnnouncementRepository) {}
```

**Cara kerja**:
1. Buka terminal, jalankan:
   ```bash
   grep -rn "from '../repositories/" backend/src --include="*.ts" | grep -v ".spec.ts"
   ```
2. Untuk setiap file yang muncul, ubah import-nya ke `domain/interfaces/`
3. Ganti nama variabel dari `XxxRepository` ke `IXxxRepository` (opsional tapi recommended)

> 💡 **Untuk file `.spec.ts`**: Boleh tetap pakai nama `XxxRepository` sebagai mock class name, tapi import-nya harus dari `domain/interfaces/`.

#### Step 1.2: Update import di presentation/ (controllers) & module files

Jangan lupa controllers dan module files juga bisa import dari `repositories/`:

```bash
grep -rn "from '../repositories/" backend/src --include="*.ts"
grep -rn "from '../../repositories/" backend/src --include="*.ts"
```

#### Step 1.3: Hapus semua file di `repositories/`

Setelah semua import sudah diupdate, hapus folder `repositories/` di setiap module:

```bash
# Cek dulu apakah masih ada yang import
grep -rn "from '../repositories/" backend/src --include="*.ts"
grep -rn "from '../../repositories/" backend/src --include="*.ts"

# Kalau sudah 0 hasil, hapus semua folders
find backend/src -type d -name "repositories" -exec rm -rf {} +
```

#### Step 1.4: Hapus duplicate interface files di `interfaces/` (bukan `domain/interfaces/`)

File-file ini hanya re-export:
```
academic/master-data/employment-type/interfaces/  → hapus
academic/master-data/occupation/interfaces/        → hapus
academic/master-data/position/interfaces/          → hapus
academic/master-data/position-category/interfaces/ → hapus
platform/master-data/education/interfaces/         → hapus
platform/master-data/social-media/interfaces/      → hapus
platform/user/interfaces/                          → hapus
platform/access-control/role/interfaces/           → hapus
platform/access-control/permission/interfaces/     → hapus
```

**Sebelum hapus**, cek apakah ada import ke folder ini:
```bash
grep -rn "from '../interfaces/" backend/src --include="*.ts"
grep -rn "from '../../interfaces/" backend/src --include="*.ts"
```
Update import-nya dulu ke `domain/interfaces/`, baru hapus.

#### Step 1.5: Verifikasi

```bash
pnpm --filter backend run typecheck   # harus 0 error
pnpm --filter backend run build       # harus sukses
```

### Checklist Tahap 1

- [ ] Semua import `from '../repositories/'` sudah diganti ke `from '../domain/interfaces/'`
- [ ] Folder `repositories/` dihapus di semua module
- [ ] Folder `interfaces/` (yang bukan `domain/interfaces/`) dihapus
- [ ] `typecheck` dan `build` pass

---

## Tahap 2: Perbaiki Arah Import Domain

### Apa masalahnya?

**~40 file** di `domain/interfaces/` mengimport tipe dari `infrastructure/persistence/`:

```typescript
// ❌ SALAH: domain layer import dari infrastructure layer
// domain/interfaces/student-repository.interface.ts
import { StudentWithDetails } from '../../infrastructure/persistence/prisma-student.includes.js';
```

Ini melanggar **Dependency Rule** dari Clean Architecture:
- Domain (dalam) **TIDAK BOLEH** tahu tentang Infrastructure (luar)
- Infrastructure yang harus depend ke Domain, bukan sebaliknya

### Apa yang harus dilakukan?

#### Step 2.1: Pahami Konsepnya

```
SEBELUM (salah — domain depends on infrastructure):

  domain/interfaces/       ←──import──   ❌
       ↑                                  │
       │                                  │
  infrastructure/persistence/prisma-xxx.includes.ts
       (definisi StudentWithDetails = Prisma.GetPayload<...>)


SESUDAH (benar — infrastructure depends on domain):

  domain/entities/student.entity.ts
       (definisi StudentWithDetails = plain TypeScript interface)
       ↑
       │ import
       │
  domain/interfaces/student-repository.interface.ts
       ↑
       │ extends/implements
       │
  infrastructure/persistence/prisma-student.repository.ts
       (return Prisma query result, yang compatible dengan domain type)
```

#### Step 2.2: Definisikan tipe domain murni di `domain/entities/`

Untuk setiap `XxxWithDetails` type yang saat ini didefinisikan di `prisma-xxx.includes.ts`, buat versi domain-nya di `domain/entities/`:

```typescript
// ✅ BUAT INI: domain/entities/student.entity.ts
export interface StudentEntity {
  id: string;
  nis: string;
  userId: string;
  status: string;
  deletedAt: Date | null;
}

// Tipe untuk query results yang include relasi
export interface StudentWithDetails extends StudentEntity {
  user: {
    id: string;
    identifier: string;
    profile: {
      name: string;
      gender: string | null;
      birthDate: Date | null;
      // ... field lain yang dipakai use-case
    } | null;
  };
  enrollments: Array<{
    id: string;
    classroomId: string;
    semesterId: string;
    status: string;
  }>;
}
```

**Cara menentukan field apa saja**:
1. Buka `prisma-xxx.includes.ts` → lihat apa saja yang di-include
2. Buka use-case/controller yang pakai tipe ini → lihat field apa yang diakses
3. Tulis interface dengan field-field itu saja

#### Step 2.3: Update domain interface imports

```diff
// domain/interfaces/student-repository.interface.ts

// SEBELUM
-import { StudentWithDetails } from '../../infrastructure/persistence/prisma-student.includes.js';

// SESUDAH
+import type { StudentWithDetails } from '../entities/student.entity.js';
```

#### Step 2.4: Update concrete repository (kalau perlu)

Di `prisma-xxx.repository.ts`, pastikan return type-nya compatible dengan domain interface.

Biasanya Prisma `GetPayload` return type adalah **superset** dari domain type, jadi langsung compatible. Kalau tidak, tambahkan mapper:

```typescript
// infrastructure/persistence/prisma-student.repository.ts
async findById(id: string): Promise<StudentWithDetails | null> {
  const result = await this.prisma.student.findFirst({
    where: { id, deletedAt: null },
    include: STUDENT_INCLUDE,
  });
  return result; // biasanya langsung compatible karena Prisma return superset
}
```

#### Step 2.5: Verifikasi

```bash
# Pastikan tidak ada lagi import infrastructure di domain
grep -rn "from '../../infrastructure" backend/src/**/domain --include="*.ts"
# Harus 0 hasil!

pnpm --filter backend run typecheck
pnpm --filter backend run build
```

### Checklist Tahap 2

- [ ] Setiap module punya `domain/entities/xxx.entity.ts` dengan tipe `XxxWithDetails` (sebagian sudah ada)
- [ ] Semua `domain/interfaces/` import dari `../entities/` — bukan dari `../../infrastructure/`
- [ ] `grep "from '../../infrastructure" domain/` → 0 results
- [ ] `typecheck` dan `build` pass

---

## Tahap 3: Ganti Semua `any` dengan Tipe Domain

### Apa masalahnya?

**~87+ occurrences** dari `any` di `domain/interfaces/`:

```typescript
// ❌ Ini tidak punya kontrak yang jelas
abstract create(dto: any): Promise<any>;
abstract findAll(query?: any): Promise<any>;
```

`any` = "terima apa saja, return apa saja" → tidak ada type safety, IDE tidak bisa autocomplete, error baru ketahuan saat runtime.

### Apa yang harus dilakukan?

#### Step 3.1: Ganti parameter `dto: any` dengan DTO class yang sudah ada

```diff
// SEBELUM
-abstract create(dto: any): Promise<GradeEntity>;

// SESUDAH — import DTO yang sudah ada
+import type { CreateGradeDto } from '../../dto/request/create-grade.dto.js';
+abstract create(dto: CreateGradeDto): Promise<GradeEntity>;
```

**Aturan prioritas**:
1. Kalau DTO class sudah ada di `dto/request/` → **pakai itu**
2. Kalau belum ada → buat interface baru di `domain/interfaces/` (inline) atau `domain/entities/`
3. **JANGAN** import Prisma types (`Prisma.XxxCreateInput`)

#### Step 3.2: Ganti return `Promise<any>` dengan tipe domain

```diff
// SEBELUM
-abstract findAll(query?: any): Promise<any>;

// SESUDAH
+import type { GradeEntity } from '../entities/grade.entity.js';
+import type { GradeQueryDto } from '../../dto/request/grade-query.dto.js';
+import type { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
+abstract findAll(query: GradeQueryDto): Promise<PaginatedResult<GradeEntity>>;
```

#### Step 3.3: Ganti `as any` casts di infrastructure (~19 occurrences)

```diff
// SEBELUM
-return result as any;

// SESUDAH — kalau tipe sudah benar, hapus cast
+return result;

// Atau kalau Prisma result perlu di-cast ke domain type (karena superset):
+return result as StudentWithDetails;
```

#### Step 3.4: Ganti Prisma enum imports di `.spec.ts`

```diff
// SEBELUM
-import { UserGender } from '@prisma/client';

// SESUDAH — import dari shared domain enums yang sudah ada
+import { UserGender } from '../../../../shared/domain/enums/user-gender.enum.js';
```

> 💡 Cek folder `shared/domain/enums/` — banyak domain enum yang sudah didefinisikan di sana.

#### Step 3.5: Verifikasi

```bash
# Cek sisa any di domain interfaces
grep -rn ": any" backend/src/**/domain/interfaces --include="*.ts"
# Target: 0 results (atau minimal < 5 untuk edge cases yang benar-benar perlu)

pnpm --filter backend run typecheck
pnpm --filter backend run build
```

### Checklist Tahap 3

- [ ] Semua parameter `dto: any` diganti dengan DTO class atau domain interface
- [ ] Semua return `Promise<any>` diganti dengan tipe domain
- [ ] Semua `as any` di infrastructure dihapus atau diganti cast yang benar
- [ ] Prisma enums di `.spec.ts` diganti domain enums
- [ ] `typecheck` dan `build` pass

---

## Tahap 4: Fix `lint:strict` Sampai 0 Error

### Apa masalahnya?

`pnpm --filter backend run lint:strict` masih gagal dengan **1458 errors**.

Mayoritas error:
- `@typescript-eslint/no-unsafe-assignment` — assign value `any` ke variabel
- `@typescript-eslint/no-unsafe-member-access` — akses property dari value `any`
- `@typescript-eslint/no-explicit-any` — deklarasi tipe `any` eksplisit
- `@typescript-eslint/no-unsafe-return` — return value `any`
- `@typescript-eslint/no-unnecessary-type-assertion` — cast yang tidak perlu

### Apa yang harus dilakukan?

> ⚠️ **Kalau Tahap 1-3 sudah benar**, jumlah error di tahap ini akan **berkurang drastis** karena banyak error berasal dari pemakaian `any`.

#### Step 4.1: Jalankan auto-fix dulu

```bash
pnpm --filter backend run lint:strict -- --fix
```

Ini akan fix beberapa error yang bisa di-fix otomatis (misalnya hapus unnecessary type assertions).

#### Step 4.2: Jalankan lint dan lihat sisa error

```bash
pnpm --filter backend run lint:strict 2>&1 | head -200
```

#### Step 4.3: Fix per file

Untuk setiap file yang error:

| Error | Cara Fix |
|---|---|
| `no-explicit-any` | Ganti `: any` dengan tipe yang tepat |
| `no-unsafe-assignment` | Tambahkan type annotation atau cast yang benar |
| `no-unsafe-member-access` | Definisikan tipe untuk object yang diakses |
| `no-unsafe-return` | Pastikan return type sesuai |
| `no-unnecessary-type-assertion` | Hapus `as XxxType` yang tidak perlu |

#### Step 4.4: Verifikasi final

```bash
pnpm --filter backend run typecheck      # 0 error
pnpm --filter backend run build          # sukses
pnpm --filter backend run lint:strict    # 0 error, 0 warning
pnpm --filter backend run test           # semua pass
```

### Checklist Tahap 4

- [ ] `lint:strict` → 0 errors, 0 warnings
- [ ] `typecheck` → 0 errors
- [ ] `build` → sukses
- [ ] `test` → semua pass

---

## Urutan Pengerjaan per Module

Kerjakan **per bounded context** agar mudah di-review:

```
1. shared/          (domain enums, entities, interfaces)
2. platform/        (user, profile, auth, announcement, settings, ...)
3. academic/        (academic-year, semester, student, teacher, ...)
4. inventory/       (asset, circulation, approval, master-data)
5. admission/       (applicant, application, wave, announcement)
```

Dalam setiap bounded context, kerjakan **per module** dan lakukan Tahap 1-4 sekaligus untuk module itu sebelum pindah ke module berikutnya. Ini lebih mudah daripada melakukan semua Tahap 1 dulu untuk semua module, lalu semua Tahap 2, dst.

---

## Estimasi Waktu

| Tahap | Effort |
|---|---|
| Tahap 1: Hapus re-export files + update imports | 4-6 jam |
| Tahap 2: Definisikan domain types + fix dependency rule | 8-12 jam |
| Tahap 3: Ganti semua `any` dengan tipe presisi | 6-10 jam |
| Tahap 4: Fix lint:strict | 4-8 jam |
| **Total** | **22-36 jam** |

---

## Tips untuk Junior Programmer

1. **Jangan takut salah** — selama `typecheck` dan `build` pass, perubahan kamu aman
2. **Commit sering** — setiap selesai 1 module, commit. Kalau rusak, bisa rollback
3. **Kalau bingung tipe apa yang harus dipakai** — lihat use-case yang menggunakan repository method tersebut. Field apa yang diakses? Itulah yang harus ada di tipe domain-nya
4. **Jangan ubah logic** — di plan ini kita hanya mengubah **struktur dan tipe**, bukan behavior. Kalau test yang sudah pass jadi gagal, berarti ada yang salah
5. **Pakai IDE** — hover mouse di atas variabel untuk lihat tipe-nya. Ini sangat membantu
6. **Kalau stuck** — tanya, jangan nebak. Lebih baik tanya "apa tipe yang tepat untuk parameter ini?" daripada pakai `any` lagi
