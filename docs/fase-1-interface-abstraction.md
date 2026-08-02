# Fase 1 — Interface Abstraction untuk Concrete Repositories

## Tujuan

Membuat `IXxxRepository` abstract class di `domain/interfaces/` untuk semua module yang belum punya,
lalu mendaftarkan di NestJS DI menggunakan `{ provide: IXxxRepository, useClass: XxxRepository }`.

## Prinsip

- **Clean Architecture**: Use-cases hanya depend pada abstract interface (inner circle), bukan concrete Prisma class (outer circle)
- **nestjs-modular-monolith**: "Repository interfaces live in domain layer; implementations in infrastructure"
- **Testability**: Dengan interface, unit tests bisa mock repository tanpa PrismaService

## Pola Referensi

Lihat module `academic/subject` sebagai contoh yang sudah benar:

```
subject/
├── domain/
│   └── interfaces/
│       └── subject-repository.interface.ts    ← abstract class ISubjectRepository
├── infrastructure/
│   └── persistence/
│       └── prisma-subject.repository.ts       ← implements ISubjectRepository
├── use-cases/
│   └── get-subjects.use-case.ts               ← inject ISubjectRepository
└── subject.module.ts                          ← { provide: ISubjectRepository, useClass: PrismaSubjectRepository }
```

## Modules yang Perlu Dikerjakan

### Grup A: Tidak Punya Interface Sama Sekali (6 module)

Buat dari nol: `domain/interfaces/` + abstract class + update DI registration.

#### 1. `platform/audit-log`

**File saat ini**: `repositories/audit-log.repository.ts` (73 lines, concrete class)

**Langkah**:
1. Buat `platform/audit-log/domain/interfaces/audit-log-repository.interface.ts`:
   ```typescript
   import { AuditLogQueryDto } from '../../dto/request/audit-log-query.dto.js';
   import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

   export interface AuditLogEntry {
     id: string;
     userId: string | null;
     action: string;
     resource: string;
     resourceId: string | null;
     metadata: unknown;
     ipAddress: string | null;
     userAgent: string | null;
     createdAt: Date;
     user?: { id: string; identifier: string } | null;
   }

   export interface CreateAuditLogInput {
     userId?: string | null;
     action: string;
     resource: string;
     resourceId?: string | null;
     metadata?: unknown;
     ipAddress?: string | null;
     userAgent?: string | null;
   }

   export abstract class IAuditLogRepository {
     abstract findAll(query: AuditLogQueryDto): Promise<PaginatedResult<AuditLogEntry>>;
     abstract create(data: CreateAuditLogInput): Promise<AuditLogEntry>;
   }
   ```
2. Rename `repositories/audit-log.repository.ts` → `infrastructure/persistence/prisma-audit-log.repository.ts`
3. Add `implements IAuditLogRepository` (atau `extends IAuditLogRepository`)
4. Update `audit-log.module.ts`:
   ```typescript
   providers: [
     { provide: IAuditLogRepository, useClass: PrismaAuditLogRepository },
     ...
   ],
   ```
5. Update semua use-cases yang inject `AuditLogRepository` → inject `IAuditLogRepository`

#### 2. `platform/dashboard`

**File saat ini**: `repositories/dashboard.repository.ts` (187 lines, concrete class)

**Langkah**:
1. Buat `platform/dashboard/domain/interfaces/dashboard-repository.interface.ts`:
   ```typescript
   export interface DashboardStats {
     activeStudents: number;
     activeTeachers: number;
     // ... sesuaikan dengan method yang ada
   }

   export abstract class IDashboardRepository {
     abstract countActiveStudents(): Promise<number>;
     abstract countActiveTeachers(): Promise<number>;
     // ... tambahkan semua method dari concrete class
   }
   ```
2. Rename → `infrastructure/persistence/prisma-dashboard.repository.ts`
3. Update module + use-cases

#### 3. `platform/profile/achievement`

**File saat ini**: `repositories/achievement.repository.ts` (73 lines)

**Langkah**:
1. Buat `platform/profile/achievement/domain/interfaces/achievement-repository.interface.ts`
2. Definisikan abstract methods berdasarkan concrete class
3. Pindahkan `ACHIEVEMENT_INCLUDE` ke infrastructure
4. Rename → `infrastructure/persistence/prisma-achievement.repository.ts`
5. Update module + use-cases

#### 4. `platform/profile/educational-history`

**File saat ini**: `repositories/educational-history.repository.ts`

**Langkah**: Sama seperti pola #3

#### 5. `platform/profile/scholarship`

**File saat ini**: `repositories/scholarship.repository.ts`

**Langkah**: Sama seperti pola #3

#### 6. `platform/settings`

**File saat ini**: `repositories/app-setting.repository.ts` (68 lines)

**Langkah**:
1. Buat `platform/settings/domain/interfaces/app-setting-repository.interface.ts`
2. Definisikan `AppSettingScalarInput` interface di sini (tanpa Prisma types)
3. Pindahkan `AppKey` enum ke domain type atau re-export dari interface
4. Rename → `infrastructure/persistence/prisma-app-setting.repository.ts`
5. Update `settings.module.ts` + use-cases

### Grup B: Punya Interface tapi Concrete Repo di `repositories/` (7 module)

Module ini **sudah punya interface** di `interfaces/` tapi concrete implementation berada di `repositories/` bukannya `infrastructure/persistence/`. Perlu:
- Pindahkan concrete repo ke `infrastructure/persistence/prisma-xxx.repository.ts`
- Pindahkan interface dari `interfaces/` ke `domain/interfaces/`
- Update module DI registration ke `{ provide: IXxxRepository, useClass: PrismaXxxRepository }`

#### 7. `platform/file`

**Khusus**: Punya `domain/interfaces/image-optimizer.interface.ts` tapi **belum punya** `IFileRepository`.

**Langkah**:
1. Buat `platform/file/domain/interfaces/file-repository.interface.ts`
2. Pindahkan `repositories/file.repository.ts` → `infrastructure/persistence/prisma-file.repository.ts`
3. Update `file.module.ts` + use-cases

#### 8-11. `academic/master-data/employment-type`, `occupation`, `position`, `position-category`

**Status**: Sudah punya interface di `interfaces/` + concrete repo di `repositories/`

**Langkah per module**:
1. Pindahkan `interfaces/xxx-repository.interface.ts` → `domain/interfaces/xxx-repository.interface.ts`
2. Pindahkan `repositories/xxx.repository.ts` → `infrastructure/persistence/prisma-xxx.repository.ts`
3. Cek apakah module sudah menggunakan `{ provide: IXxxRepository, useClass: XxxRepository }` — jika belum, update
4. Update semua import paths

#### 12-13. `platform/master-data/education`, `social-media`

**Langkah**: Sama seperti pola #8-11

---

## Checklist Verifikasi

Setelah selesai semua module:

- [ ] Semua use-cases inject `IXxxRepository`, bukan concrete class
- [ ] Semua NestJS module menggunakan `{ provide: IXxxRepository, useClass: PrismaXxxRepository }`
- [ ] `pnpm --filter backend run lint:strict` → 0 errors
- [ ] `pnpm --filter backend run build` → 0 errors
- [ ] `pnpm --filter backend run test` → semua pass
- [ ] Tidak ada `PrismaService` di-import langsung oleh use-case atau controller manapun

---

## Catatan Penting

- Gunakan `abstract class` (bukan `interface`) untuk DI token di NestJS karena TypeScript interface hilang saat compile
- Untuk method return types, sementara boleh pakai Prisma generated types (lihat Fase 2 untuk pure domain types)
- Jangan lupa update `exports: [IXxxRepository]` di module jika repository di-consume oleh module lain
