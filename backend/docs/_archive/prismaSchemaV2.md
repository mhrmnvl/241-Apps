# 241 HUB

# PRISMA SCHEMA FINAL DESIGN V1

Version: 1.0

Status: Approved For Implementation

Database:
PostgreSQL

ORM:
Prisma ORM

Architecture:
Multi-Tenant SaaS

Tenant Strategy:
Denormalized Tenant Scope

---

# DESIGN PRINCIPLES

## Multi Tenant First

Every business entity must be scoped by:

- organizationId
- schoolUnitId

except platform entities.

---

## UUID Primary Key

All entities use:

id String @id @default(uuid())

---

## Soft Delete

All business entities must contain:

deletedAt DateTime?

---

## Audit Columns

All business entities must contain:

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

deletedAt DateTime?

---

## Tenant Isolation

All queries must include:

organizationId

schoolUnitId

except Super Admin.

---

# SCHEMA MODULES

Platform Domain

Academic Domain

Shared Domain

Future Domain

---

# PLATFORM DOMAIN

## Organization

Purpose:

Tenant Owner

Relations:

Organization
→ SchoolUnit[]

Organization
→ User[]

Fields:

id

code

name

status

createdAt

updatedAt

deletedAt

Indexes:

code

status

---

## SchoolUnit

Purpose:

School Entity

Examples:

SMP

SMA

SMK

Relations:

SchoolUnit
→ User[]

SchoolUnit
→ Student[]

SchoolUnit
→ Teacher[]

SchoolUnit
→ Classroom[]

Fields:

id

organizationId

code

name

level

npsn

status

createdAt

updatedAt

deletedAt

Indexes:

organizationId

code

level

---

## User

Purpose:

Identity Layer

Relations:

User
→ Profile

User
→ UserRole[]

User
→ Student?

User
→ Parent?

User
→ Teacher?

Fields:

id

organizationId

schoolUnitId

username

email

password

status

lastLoginAt

createdAt

updatedAt

deletedAt

Indexes:

organizationId

schoolUnitId

username

email

---

## Profile

Purpose:

Personal Information

Fields:

id

userId

fullName

nik

gender

birthPlace

birthDate

phone

photo

---

## Role

Fields:

id

code

name

description

---

## Permission

Fields:

id

code

name

resource

action

---

## UserRole

Fields:

id

userId

roleId

Constraints:

UNIQUE(userId, roleId)

---

## RolePermission

Fields:

id

roleId

permissionId

Constraints:

UNIQUE(roleId, permissionId)

---

# ACADEMIC DOMAIN

## AcademicYear

Relations:

AcademicYear
→ Semester[]

AcademicYear
→ Classroom[]

Fields:

id

organizationId

schoolUnitId

name

startDate

endDate

isActive

Indexes:

organizationId

schoolUnitId

isActive

---

## Semester

Relations:

Semester
→ Assessment[]

Semester
→ ReportCard[]

Fields:

id

organizationId

schoolUnitId

academicYearId

name

sequence

isActive

---

## Grade

Fields:

id

organizationId

schoolUnitId

code

name

level

---

## Student

Relations:

Student
→ Enrollment[]

Student
→ Attendance[]

Student
→ AssessmentScore[]

Student
→ ReportCard[]

Student
→ StudentParent[]

Fields:

id

organizationId

schoolUnitId

userId

nis

nisn

status

Indexes:

organizationId

schoolUnitId

nis

nisn

---

## Parent

Relations:

Parent
→ StudentParent[]

Fields:

id

organizationId

schoolUnitId

userId

occupation

---

## StudentParent

Bridge Table

Fields:

id

organizationId

schoolUnitId

studentId

parentId

relationship

Constraints:

UNIQUE(studentId, parentId)

---

## Teacher

Relations:

Teacher
→ SubjectTeacher[]

Teacher
→ HomeroomAssignment[]

Fields:

id

organizationId

schoolUnitId

userId

teacherCode

status

Indexes:

teacherCode

---

## HomeroomAssignment

Purpose:

Classroom Homeroom Teacher

Fields:

id

organizationId

schoolUnitId

teacherId

classroomId

academicYearId

Constraints:

UNIQUE(classroomId, academicYearId)

---

## Classroom

Relations:

Classroom
→ Enrollment[]

Classroom
→ Schedule[]

Classroom
→ SubjectTeacher[]

Fields:

id

organizationId

schoolUnitId

academicYearId

gradeId

name

capacity

---

## Enrollment

Purpose:

Student Academic Journey

Fields:

id

organizationId

schoolUnitId

studentId

classroomId

academicYearId

status

---

## Subject

Fields:

id

organizationId

schoolUnitId

code

name

---

## SubjectTeacher

Fields:

id

organizationId

schoolUnitId

subjectId

teacherId

classroomId

Constraints:

UNIQUE(subjectId, teacherId, classroomId)

---

## Schedule

Fields:

id

organizationId

schoolUnitId

classroomId

subjectTeacherId

dayOfWeek

startTime

endTime

---

## AttendanceSession

Fields:

id

organizationId

schoolUnitId

scheduleId

date

topic

---

## Attendance

Fields:

id

organizationId

schoolUnitId

attendanceSessionId

studentId

status

note

Constraints:

UNIQUE(attendanceSessionId, studentId)

---

## Assessment

Fields:

id

organizationId

schoolUnitId

subjectTeacherId

semesterId

title

type

weight

publishedAt

lockedAt

---

## AssessmentScore

Fields:

id

organizationId

schoolUnitId

assessmentId

studentId

score

note

Constraints:

UNIQUE(assessmentId, studentId)

---

## ReportCard

Fields:

id

organizationId

schoolUnitId

studentId

semesterId

classroomId

publishedBy

publishedAt

homeroomNote

Constraints:

UNIQUE(studentId, semesterId)

---

# SHARED DOMAIN

## Address

Reusable Entity

Target:

User

Student

Parent

Teacher

SchoolUnit

Pattern:

addressableType

addressableId

---

## File

Reusable Entity

Target:

Profile

Document

Export

Attachment

Pattern:

entityType

entityId

---

## Notification

Fields:

id

userId

title

message

isRead

readAt

---

## AuditLog

Fields:

id

organizationId

schoolUnitId

userId

action

entity

entityId

payload

createdAt

---

# ENUMS

UserStatus

ACTIVE

INACTIVE

SUSPENDED

---

SchoolLevel

SMP

SMA

SMK

MADRASAH

---

StudentStatus

ACTIVE

GRADUATED

TRANSFERRED

INACTIVE

---

AttendanceStatus

PRESENT

SICK

PERMISSION

ABSENT

---

AssessmentType

ASSIGNMENT

QUIZ

PRACTICE

MIDTERM

FINAL

---

# INDEX STRATEGY

Required Indexes

organizationId

schoolUnitId

academicYearId

semesterId

studentId

teacherId

classroomId

subjectId

---

Composite Indexes

organizationId + schoolUnitId

organizationId + status

schoolUnitId + status

---

# IMPLEMENTATION ORDER

Phase 1

Organization

SchoolUnit

User

RBAC

---

Phase 2

Academic Structure

AcademicYear

Semester

Grade

---

Phase 3

Student

Parent

Teacher

---

Phase 4

Classroom

Enrollment

Subject

Schedule

---

Phase 5

Attendance

Assessment

ReportCard

---

# SUCCESS CRITERIA

Schema Supports:

Multi Tenant

Multi School Unit

RBAC

Academic MVP

Parent Portal

Future Finance

Future Docs

Future HR

Future PPDB

Without Breaking Existing Academic Logic
