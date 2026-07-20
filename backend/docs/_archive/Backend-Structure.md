# 241 HUB

# BACKEND ARCHITECTURE & NAMING CONVENTIONS

Version: 1.0

Framework:
NestJS

Architecture:
Modular Monolith

Database:
PostgreSQL

ORM:
Prisma

Language:
English Only

---

# CORE ARCHITECTURE

241 Hub uses:

* Modular Monolith
* Domain Driven Design
* Feature First Architecture
* Repository Pattern
* Use Case Services
* RBAC + Permission Based Access Control
* Multi Tenant Architecture

---

# ARCHITECTURE PRINCIPLES

1. Domain First

2. Feature First

3. One File = One Responsibility

4. Controllers Must Stay Thin

5. Services Own Business Logic

6. Repositories Own Database Access

7. Permission First

8. Tenant First

9. Explicit Naming

10. English Only

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

Example:

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

# DOMAIN NAMING

Use plural domain names.

Good:

students

teachers

parents

subjects

classrooms

assessments

report-cards

---

Bad:

student

teacher

subject

assessment

report-card

---

# MODULE NAMING

Module names must represent business domains.

Good:

students.module.ts

teachers.module.ts

classrooms.module.ts

attendance.module.ts

---

Bad:

student-management.module.ts

teacher-management.module.ts

master-data.module.ts

common.module.ts

utils.module.ts

---

# CONTROLLER NAMING

Pattern:

resource.controller.ts

Examples:

students.controller.ts

teachers.controller.ts

subjects.controller.ts

---

# SERVICE NAMING

Use Use Case Pattern.

Good:

create-student.service.ts

update-student.service.ts

delete-student.service.ts

promote-student.service.ts

graduate-student.service.ts

---

Bad:

student.service.ts

common.service.ts

helper.service.ts

---

# REPOSITORY NAMING

Pattern:

resource.repository.ts

Examples:

students.repository.ts

teachers.repository.ts

subjects.repository.ts

---

Repository owns Prisma access.

---

# DTO NAMING

Pattern:

action-resource.dto.ts

Examples:

create-student.dto.ts

update-student.dto.ts

student-query.dto.ts

assign-parent.dto.ts

---

Bad:

student.dto.ts

data.dto.ts

request.dto.ts

---

# ENTITY NAMING

Pattern:

resource.entity.ts

Examples:

student.entity.ts

teacher.entity.ts

attendance.entity.ts

---

Entities represent domain models.

Not database models.

---

# POLICY NAMING

Pattern:

resource.policy.ts

Examples:

student.policy.ts

teacher.policy.ts

assessment.policy.ts

---

Examples:

canCreateStudent

canUpdateStudent

canDeleteStudent

canPublishAssessment

---

# MAPPER NAMING

Pattern:

resource.mapper.ts

Examples:

student.mapper.ts

teacher.mapper.ts

attendance.mapper.ts

---

Responsibility:

Prisma → Entity

Entity → Response

DTO → Entity

---

# VALIDATOR NAMING

Pattern:

resource.validator.ts

Examples:

student.validator.ts

assessment.validator.ts

---

# CONSTANT NAMING

Pattern:

resource.constants.ts

Examples:

student.constants.ts

attendance.constants.ts

role.constants.ts

---

# EXCEPTION NAMING

Pattern:

business-case.exception.ts

Examples:

student-not-found.exception.ts

student-already-exists.exception.ts

attendance-already-submitted.exception.ts

report-card-already-published.exception.ts

---

Never use:

throw new Error()

---

# ENUM NAMING

Pattern:

resource.enum.ts

Examples:

student-status.enum.ts

attendance-status.enum.ts

assessment-type.enum.ts

---

# TYPE NAMING

Pattern:

resource.types.ts

Examples:

student.types.ts

teacher.types.ts

attendance.types.ts

---

# EVENT NAMING

Pattern:

resource-action.event.ts

Examples:

student-created.event.ts

attendance-submitted.event.ts

assessment-published.event.ts

report-card-published.event.ts

---

# FILE NAMING

Use kebab-case.

Good:

create-student.service.ts

student-status.enum.ts

attendance.repository.ts

---

Bad:

CreateStudentService.ts

studentStatusEnum.ts

attendanceRepository.ts

---

# FOLDER NAMING

Use plural.

Good:

students

teachers

subjects

classrooms

repositories

controllers

services

---

Bad:

student

teacher

subject

repository

service

---

# API ROUTE NAMING

Use plural resources.

Good:

/students

/students/:id

/teachers

/classrooms

/subjects

---

Bad:

/student

/getStudents

/createStudent

---

# DATABASE MODEL NAMING

Prisma Models:

PascalCase

Good:

Student

Teacher

Classroom

AcademicYear

AssessmentScore

ReportCard

---

# DATABASE TABLE NAMING

Use snake_case plural.

Good:

students

teachers

assessment_scores

report_cards

academic_years

---

# DATABASE COLUMN NAMING

Use snake_case.

Good:

organization_id

school_unit_id

created_at

updated_at

published_at

---

Bad:

organizationId

schoolUnitId

createdAt

---

# SERVICE RULES

One service

One use case

---

Good:

create-student.service.ts

Only creates students.

---

Bad:

student.service.ts

Contains:

* create
* update
* delete
* import
* export
* promotion
* graduation

---

# CONTROLLER RULES

Controllers must:

* Receive request
* Validate request
* Call service
* Return response

Nothing else.

---

Forbidden:

Business logic

Database access

Permission logic

Complex mapping

---

# REPOSITORY RULES

Repositories must:

* Access Prisma
* Build queries

Only.

---

Forbidden:

Business rules

Permission checks

Validation

---

# PERMISSION RULES

Never check roles.

Bad:

user.role === 'ADMIN'

user.role === 'TEACHER'

---

Required:

hasPermission(
'student.create'
)

---

# TENANT RULES

Every business query must contain:

organizationId

schoolUnitId

---

Forbidden:

findMany({})

---

Required:

findMany({
organizationId,
schoolUnitId
})

---

# LANGUAGE RULES

Backend codebase must use English only.

---

Allowed:

Student

Teacher

Classroom

Assessment

ReportCard

HomeroomTeacher

SubjectTeacher

AcademicYear

Semester

Attendance

---

Forbidden:

Siswa

Guru

Kelas

Mapel

Nilai

Rapor

TahunAjaran

SemesterAktif

---

# NO GENERIC NAMES

Forbidden:

data

result

temp

helper

utils

manager

service

common

base

---

Required:

studentRepository

attendanceValidator

assessmentMapper

createStudentService

---

# MODULE DEPENDENCY RULES

Platform

Can be used by everyone.

---

Academic

Cannot access Finance.

---

Finance

Cannot access Academic internals.

---

Domains communicate through contracts.

---

# FORBIDDEN

God Service

God Module

Magic Strings

Magic Numbers

Inline Types

Inline Interfaces

Inline Validation

Role Checking By String

Business Logic In Controllers

Prisma Access Outside Repository

Cross Domain Direct Coupling

Generic Folder Names

Indonesian Naming

Any Type

as any

---

# SUCCESS CRITERIA

A developer can locate any code within 30 seconds.

A module can be extracted into a microservice later.

Every feature remains independently maintainable.

Every query is tenant safe.

Every action is permission controlled.

The codebase remains maintainable at:

100+ modules

500+ endpoints

Multi-tenant SaaS scale.
