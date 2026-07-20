# 241 HUB

# BACKEND CODING RULES

Version: 1.1

Module system:
NodeNext ESM (relative imports carry the `.js` extension)

Framework:
NestJS

Architecture:
Modular Monolith

ORM:
Prisma

Database:
PostgreSQL

Authorization:
RBAC + Permission Based Access Control

---

# CORE PRINCIPLES

1. Modular Monolith

2. Domain Driven Modules

3. One File = One Concern

4. Business Logic Inside Service

5. Controllers Stay Thin

6. Explicit Dependencies

7. Feature First

8. Permission First

9. Tenant First

10. Clean Code Over Clever Code

---

# HIGH LEVEL STRUCTURE

src

├── core
├── shared
├── platform
├── academic
├── inventory
└── admission

---

# DOMAIN STRUCTURE

platform

academic

inventory

admission

Each domain owns (actual layering):

- presentation (controllers — thin, HTTP only)
- use-cases (one class per business operation)
- repositories (abstract repository interface — the port/token)
- infrastructure (persistence: Prisma repo impl, mappers, parsers)
- domain (entities, enums, events, interfaces)
- dto (request/ and response/ — one DTO per file)
- types

---

# MODULE STRUCTURE

Example

academic/student

student
├── presentation/       # controllers (thin, HTTP only)
├── use-cases/          # CreateStudentUseCase, UpdateStudentUseCase, ...
├── repositories/       # abstract repository interface (port + injection token)
├── infrastructure/     # persistence/ (PrismaStudentRepository), mappers, parsers
├── domain/             # entities, enums, events, interfaces
├── dto/                # request/ and response/ — one DTO per file
├── types/
└── student.module.ts

---

# FORBIDDEN STRUCTURE

src

controllers

services

repositories

dto

shared globally

Never organize by technical layer.

Always organize by domain.

---

# CONTROLLER RULES

Controller responsibility:

- receive request
- validate request
- call service
- return response

Nothing else.

---

# CONTROLLER FORBIDDEN

Business logic

Database query

Complex mapping

Permission logic

Validation logic

---

# SERVICE RULES

Service owns:

Business Logic

Examples:

Student promotion

Report card generation

Attendance validation

Assessment publication

---

# SERVICE RULES

One service

One business responsibility

---

Bad

StudentService

3000 lines

handles everything

---

Good

CreateStudentService

UpdateStudentService

PromoteStudentService

GraduateStudentService

---

# SERVICE SIZE

Recommended

50-150 lines

Review

200+ lines

Refactor

300+ lines

---

# REPOSITORY RULES

Repository owns:

Database access only

---

Repository must never contain:

Business logic

Permission logic

Validation logic

---

Allowed

findById()

findMany()

create()

update()

delete()

---

# PRISMA RULES

All Prisma access must go through repository layer.

Forbidden

Controller → Prisma

Service → Prisma

---

Required

Controller

↓

Service

↓

Repository

↓

Prisma

---

# DTO RULES

One DTO per file.

Split by direction into subfolders:

dto/request/   (create / update / query)

dto/response/  (response DTOs)

---

Allowed

dto/request/create-student.dto.ts

dto/request/update-student.dto.ts   (UpdateDto = PartialType of the Create DTO,
unless a field set is intentionally restricted, e.g. immutable code/FK excluded)

dto/request/student-query.dto.ts

dto/response/student-response.dto.ts

---

Forbidden

20 DTOs in one file

A response DTO living under dto/request/ (or vice versa)

---

# VALIDATION RULES

Use:

class-validator

class-transformer

---

Validation only inside DTO.

---

Forbidden

if (!name)

inside service

---

# NO INLINE TYPES

Forbidden

interface StudentData

inside service

---

Use

types/

student.types.ts

---

# NO INLINE CONSTANTS

Forbidden

status = "ACTIVE"

role = "ADMIN"

inside service

---

Use

constants/

student.constants.ts

role.constants.ts

---

# TENANT RULES

Every business query must be tenant scoped.

Required

organizationId

schoolUnitId

---

Forbidden

findMany()

without tenant filter

---

Good

findMany({
where: {
organizationId,
schoolUnitId
}
})

---

# AUTHORIZATION RULES

Never check role names.

Forbidden

user.role === "ADMIN"

---

Good

permissionService.has(
user,
"student.create"
)

---

# AUTHORIZATION ENFORCEMENT

Authorization is permission-based, enforced at the controller via the
`@RequirePermissions(...)` decorator + guard — not per-module policy files.

Example

@RequirePermissions('students.create')

@RequirePermissions('students.read')

@RequirePermissions('students.update')

@RequirePermissions('students.delete')

---

Permission strings, roles, and their design live in `IAM.md`.

---

# MAPPER RULES

Never return Prisma entities directly.

Use mapper.

---

Example

StudentEntity

↓

StudentResponseDto

---

# ENTITY RULES

Entity represents domain.

Not database.

---

Example

StudentEntity

TeacherEntity

AssessmentEntity

---

# SHARED RULES

shared contains only:

helpers

types

enums

constants

utils

---

Shared must not contain:

business logic

---

# EVENT RULES

Use domain events.

Examples

StudentCreated

AttendanceSubmitted

AssessmentPublished

ReportCardPublished

---

Events must not contain business logic.

---

# RESPONSE RULES

Use consistent response envelope.

Example

{
success: true,
message: "...",
data: {}
}

---

Pagination

{
data: [],
meta: {}
}

---

# FILE SIZE RULES

Controller

max 150 lines

---

Service

max 300 lines

---

Repository

max 200 lines

---

File

max 300 lines

---

# IMPORT RULES

Backend is NodeNext ESM. No path aliases — use relative imports, and every
relative import MUST carry the `.js` extension (source is `.ts`).

Allowed

import { AppModule } from './app.module.js'

import { StudentRepository } from '../repositories/student.repository.js'

---

# BARREL & MODULE IMPORT RULES

A feature's `index.ts` barrel = its PUBLIC API (DTOs, tokens, use-cases, guards)
for outside consumers.

NestJS Module classes:
import via `x.module.js` DIRECTLY — never through a barrel.

Cross-module DTO → DTO:
import the DTO FILE directly — never through the other feature's barrel.

Why:
a feature barrel also re-exports runtime-heavy symbols (its Module, use-cases,
repositories). A lightweight DTO importing that barrel drags the whole graph in
and closes an ESM import cycle, crashing boot with:

"Nest cannot create the <X>Module instance.
 The module at index [0] of the imports array is undefined."

(Official NestJS: barrel files must be omitted when importing module or provider
classes — https://docs.nestjs.com/faq/common-errors)

Bad

// role-response.dto.ts
import { PermissionResponseDto } from '../../../permissions/index.js'

Good

// role-response.dto.ts
import { PermissionResponseDto }
  from '../../../permissions/dto/response/permission-response.dto.js'

For a genuine mutual module/provider dependency, use forwardRef() on both sides.

---

# ERROR HANDLING

Use custom exceptions.

Examples

StudentNotFoundException

AcademicYearNotFoundException

AttendanceAlreadyExistsException

---

Forbidden

throw new Error()

---

# TRANSACTION RULES

Use Prisma transaction for:

Student Promotion

Graduation

Report Card Publish

Bulk Score Import

Attendance Finalization

---

# AUDIT RULES

Must log:

Create

Update

Delete

Publish

Approve

---

Examples

Student Created

Assessment Published

Report Card Published

---

# MODULE DEPENDENCY RULES

Domains: platform, academic, inventory, admission.

Platform

may be used by everyone (supplier)

---

academic / inventory / admission

may consume platform, but must not reach into each other's internals

---

Cross-domain access only through a module's public API (its barrel / exported
tokens / domain events) — never deep-import another domain's internals.

---

# FORBIDDEN

Business logic in controller

Prisma in controller

Prisma in service

Role checking by string

Cross-domain direct access

Global god service

5000 line service

Any type

Magic strings

Magic numbers

Direct entity exposure

Tenantless query

---

# SUCCESS CRITERIA

A feature can be removed without breaking another feature.

A domain can evolve independently.

A future microservice extraction is possible.

Every query is tenant safe.

Every action is permission controlled.

The codebase remains maintainable at 100+ modules and 500+ endpoints.
