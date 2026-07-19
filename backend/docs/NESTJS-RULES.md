# 241 HUB

# BACKEND CODING RULES

Version: 1.0

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
├── future
└── integrations

---

# DOMAIN STRUCTURE

platform

academic

future

Each domain owns:

- controllers
- services
- repositories
- dto
- entities
- mappers
- policies

---

# MODULE STRUCTURE

Example

academic/students

students

├── controllers
├── services
├── repositories
├── dto
├── entities
├── policies
├── mappers
├── constants
├── validators
└── students.module.ts

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

---

Allowed

create-student.dto.ts

update-student.dto.ts

student-query.dto.ts

---

Forbidden

20 DTOs in one file

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

# POLICY RULES

Each module owns policies.

Example

students

policies

student.policy.ts

---

Examples

canReadStudent

canCreateStudent

canUpdateStudent

canDeleteStudent

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

Use aliases.

Allowed

@/academic/students

@/platform/users

@/shared/utils

---

Forbidden

../../../../../../

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

Platform

may be used by everyone

---

Academic

must not access Finance

---

Finance

must not access Academic internals

---

Communication through contracts only

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
