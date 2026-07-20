# School Hub Backend Architecture Rules

## Purpose

This document defines mandatory architecture, structure, naming, and development rules for all backend development in School Hub.

The goal is to ensure:

- Consistent codebase structure
- High maintainability
- Clear business boundaries
- Scalable modular monolith architecture
- Easy onboarding for future developers
- AI-generated code consistency

---

# Architecture Principles

## 1. Modular Monolith

School Hub uses a Modular Monolith architecture.

Each module must represent a business capability.

Modules must be loosely coupled and highly cohesive.

Bad:

```text
employee-addresses/
profile-addresses/
institution-social-media/
```

Good:

```text
employees/
users/
organizations/
```

---

## 2. DDD Lite

School Hub follows DDD Lite principles.

Use:

- Business-oriented modules
- Domain entities
- Application services
- Repository layer

Avoid unnecessary complexity:

- CQRS
- Event Sourcing
- Aggregate Root everywhere
- Factory Pattern everywhere
- Specification Pattern everywhere

Only introduce advanced patterns when justified by business complexity.

---

## 3. Business Capability First

Module boundaries are defined by business capabilities.

Never create modules based solely on database tables.

Bad:

```text
employee-addresses/
employee-positions/
```

Good:

```text
employees/
```

Addresses and positions belong to the Employee domain.

---

# Project Structure

```text
src/
│
├── core/
├── shared/
│
├── platform/
│
├── academic/
│
├── finance/
│
├── admissions/
│
└── library/
```

---

# Core Layer

Contains technical infrastructure.

```text
core/
├── database/
├── cache/
├── logger/
├── storage/
├── mail/
├── config/
├── exceptions/
├── interceptors/
├── guards/
└── decorators/
```

Core must never contain business logic.

---

# Shared Layer

Contains reusable code.

```text
shared/
├── constants/
├── enums/
├── types/
├── dto/
├── utils/
└── validators/
```

Shared must remain framework-independent whenever possible.

---

# Platform Domain

Contains system-level capabilities.

```text
platform/
├── auth/
├── users/
├── organizations/
├── school-units/
├── employees/
├── dashboards/
├── settings/
├── notifications/
├── audit-logs/
└── access-control/
```

---

# Organization Domain

Organization represents the legal owner of one or more schools.

Examples:

- Yayasan
- Foundation
- Education Group
- School Operator

Example:

```text
Organization
└── School Unit A
└── School Unit B
└── School Unit C
```

---

# School Unit Domain

School Unit represents an individual school.

Examples:

- SMP ABC
- SMA ABC
- SMK ABC

Relationships:

```text
Organization
    └── SchoolUnit
```

Every academic data must belong to a School Unit.

---

# Academic Domain

```text
academic/
├── academic-years/
├── semesters/
├── grade-levels/
├── classrooms/
├── subjects/
├── students/
├── teachers/
├── enrollments/
├── attendance/
├── assessments/
├── report-cards/
├── promotions/
└── graduations/
```

Academic modules must never directly depend on other academic modules' internals.

Communication must happen through services or public interfaces.

---

# Module Structure

Each module must follow:

```text
module-name/
│
├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
├── mappers/
├── interfaces/
│
├── module-name.module.ts
├── module-name.controller.ts
└── module-name.service.ts
```

---

# Naming Conventions

## Directories

Use:

```text
kebab-case
```

Examples:

```text
school-units
academic-years
report-cards
```

---

## Files

Use:

```text
kebab-case
```

Examples:

```text
create-student.dto.ts
student.repository.ts
student.service.ts
```

---

## Classes

Use:

```typescript
PascalCase;
```

Examples:

```typescript
StudentService;
CreateStudentDto;
StudentRepository;
```

---

## Variables

Use:

```typescript
camelCase;
```

Examples:

```typescript
studentId;
academicYearId;
organizationId;
```

---

# Repository Rules

Repositories handle data access only.

Good:

```typescript
studentRepository.findById();
```

Bad:

```typescript
studentRepository.promoteStudent();
```

Business logic belongs in services.

---

# Service Rules

Services contain business rules.

Good:

```typescript
studentService.promoteStudent();
```

Bad:

```typescript
controller.promoteStudent();
```

Controllers must remain thin.

---

# Controller Rules

Controllers:

- Validate requests
- Call services
- Return responses

Controllers must not contain business logic.

Maximum responsibility:

```typescript
Request → Service → Response
```

---

# Prisma Rules

Use Prisma directly.

Do not create unnecessary ORM abstractions.

Good:

```typescript
PrismaService;
```

Avoid:

```typescript
GenericRepository<T>;
BaseRepository<T>;
```

unless there is a proven need.

---

# Multi-Tenant Rules

All business entities must support tenancy.

Minimum fields:

```typescript
organizationId;
schoolUnitId;
```

Examples:

```typescript
Student;
Teacher;
Attendance;
Assessment;
ReportCard;
```

must belong to:

```typescript
Organization;
SchoolUnit;
```

---

# Dependency Rules

Allowed:

```text
academic → platform
finance → platform
admissions → platform
```

Not Allowed:

```text
platform → academic
platform → finance
```

Platform is the foundation layer.

Business domains depend on platform.

Platform never depends on business domains.

---

# Golden Rule

A module represents a business capability.

A database table does not automatically deserve its own module.

Always optimize for business understanding, not database structure.
