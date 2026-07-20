# 241 HUB

# LOGICAL ERD V2

Version: 2.0

Status: Approved Design

Architecture:

Multi Tenant SaaS

Tenant Strategy:

Denormalized

Scope:

Academic MVP

---

# PLATFORM DOMAIN

Organization

1 → N SchoolUnit

Organization

1 → N User

---

SchoolUnit

1 → N User

1 → N Student

1 → N Teacher

1 → N Classroom

1 → N Subject

1 → N AcademicYear

---

User

1 → 1 Profile

N ↔ N Role

Role

N ↔ N Permission

---

# ACADEMIC STRUCTURE

AcademicYear

1 → N Semester

AcademicYear

1 → N Classroom

AcademicYear

1 → N Enrollment

---

Semester

1 → N Assessment

Semester

1 → N ReportCard

---

Grade

1 → N Classroom

---

# STUDENT DOMAIN

Student

1 → N Enrollment

Student

1 → N Attendance

Student

1 → N AssessmentScore

Student

1 → N ReportCard

Student

N ↔ N Parent

via

StudentParent

---

Parent

N ↔ N Student

via

StudentParent

---

StudentParent

N → 1 Student

N → 1 Parent

---

Enrollment

N → 1 Student

N → 1 Classroom

N → 1 AcademicYear

---

# TEACHER DOMAIN

Teacher

1 → N SubjectTeacher

Teacher

1 → N HomeroomAssignment

---

HomeroomAssignment

N → 1 Teacher

N → 1 Classroom

N → 1 AcademicYear

---

# CLASS DOMAIN

Classroom

1 → N Enrollment

Classroom

1 → N SubjectTeacher

Classroom

1 → N Schedule

Classroom

1 → N ReportCard

---

# SUBJECT DOMAIN

Subject

1 → N SubjectTeacher

---

SubjectTeacher

N → 1 Subject

N → 1 Teacher

N → 1 Classroom

---

# SCHEDULE DOMAIN

Schedule

1 → N AttendanceSession

---

AttendanceSession

1 → N Attendance

---

Attendance

N → 1 Student

N → 1 AttendanceSession

---

# ASSESSMENT DOMAIN

Assessment

1 → N AssessmentScore

---

Assessment

N → 1 Semester

Assessment

N → 1 SubjectTeacher

---

AssessmentScore

N → 1 Assessment

N → 1 Student

---

# REPORT CARD DOMAIN

ReportCard

N → 1 Student

N → 1 Semester

N → 1 Classroom

---

# MULTI TENANT RULE

Every Business Entity Must Contain:

organization_id

school_unit_id

Applicable To:

Student

Parent

Teacher

Classroom

Enrollment

Subject

SubjectTeacher

Schedule

AttendanceSession

Attendance

Assessment

AssessmentScore

ReportCard

---

# RBAC DOMAIN

User

N ↔ N Role

via

UserRole

---

Role

N ↔ N Permission

via

RolePermission

---

# SHARED DOMAIN

Address

Reusable By:

User

Student

Parent

Teacher

SchoolUnit

---

File

Reusable By:

Profile

ReportCard

Document

Attachment

---

Notification

N → 1 User

---

AuditLog

N → 1 User

---

# TOTAL DOMAINS

Platform

Academic Structure

Student

Teacher

Class

Subject

Schedule

Attendance

Assessment

Report Card

RBAC

Shared

---

# DESIGN PRINCIPLE

Organization

↓

School Unit

↓

Users

↓

Academic Data

Everything Is Tenant Scoped

Everything Is Permission Controlled

Everything Is Audit Logged
