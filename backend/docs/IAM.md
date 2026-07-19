# School Hub IAM (Identity & Access Management) Architecture

## Purpose

This document defines the Identity and Access Management (IAM) architecture for School Hub.

IAM is the foundation of the entire platform and must be implemented before Academic, Finance, Admissions, or other business modules.

---

# Module Structure

```text
platform/
│
├── auth/
├── users/
├── roles/
├── permissions/
├── sessions/
└── audit-logs/
```

---

# Design Principles

## Authentication != Authorization

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What are you allowed to do?
```

Never mix both concerns.

---

# Auth Module

Responsible for authentication only.

## Responsibilities

- Login
- Logout
- Refresh Token
- Forgot Password
- Reset Password
- Change Password
- Current User
- Token Validation

## Endpoints

```http
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/change-password
GET    /auth/me
```

## Auth Entities

```text
User
Session
```

---

# Users Module

Represents a platform account.

A User is not a Student.

A User is not a Teacher.

A User is not an Employee.

A User is only an account that can access the system.

---

## User Entity

```typescript
User;
{
  id;
  organizationId;

  username;
  email;

  passwordHash;

  isActive;

  lastLoginAt;

  createdAt;
  updatedAt;
}
```

---

## User Relationships

```text
User
 ├── Profile
 ├── Roles
 ├── Sessions
```

---

# Profile

Stores personal information.

Profile data must not be stored inside User.

---

## Profile Entity

```typescript
Profile;
{
  id;

  userId;

  fullName;

  gender;

  birthPlace;
  birthDate;

  phoneNumber;

  avatar;

  createdAt;
  updatedAt;
}
```

---

# Sessions Module

Tracks authenticated devices and tokens.

---

## Session Entity

```typescript
Session;
{
  id;

  userId;

  refreshTokenHash;

  ipAddress;

  userAgent;

  expiresAt;

  revokedAt;

  createdAt;
}
```

---

# Roles Module

Roles represent job functions.

Roles are assigned to users.

---

## Role Entity

```typescript
Role;
{
  id;

  organizationId;

  name;

  code;

  description;

  isSystem;

  createdAt;
  updatedAt;
}
```

---

## Examples

```text
Super Admin

Organization Owner

School Admin

Principal

Vice Principal

Teacher

Homeroom Teacher

Finance Staff

Student

Parent
```

---

# Permissions Module

Permissions represent actions.

Never use roles directly in code.

Always check permissions.

---

## Permission Entity

```typescript
Permission;
{
  id;

  module;

  action;

  code;

  description;
}
```

---

## Examples

```text
users.read
users.create
users.update
users.delete

students.read
students.create
students.update
students.delete

attendance.read
attendance.manage

report-cards.publish
```

---

# User Roles

Many-to-many relationship.

---

## UserRole Entity

```typescript
UserRole;
{
  userId;
  roleId;
}
```

---

# Role Permissions

Many-to-many relationship.

---

## RolePermission Entity

```typescript
RolePermission;
{
  roleId;
  permissionId;
}
```

---

# Authorization Flow

```text
User
    ↓

UserRole

    ↓

Role

    ↓

RolePermission

    ↓

Permission
```

Example:

```text
John

→ School Admin

→ students.create
→ students.update
→ students.read
```

---

# Multi-Tenant Rules

Every role belongs to an organization.

```typescript
Role;
{
  organizationId;
}
```

This allows:

```text
Organization A

Teacher
Admin

Organization B

Teacher
Admin
```

without conflicts.

---

# System Roles

Reserved roles:

```text
SUPER_ADMIN
```

Used only by platform operators.

System roles cannot be edited.

```typescript
isSystem = true;
```

---

# Permission Naming Convention

Format:

```text
resource.action
```

Examples:

```text
users.read
users.create
users.update
users.delete

roles.read
roles.create

students.read
students.create

attendance.manage
```

Avoid:

```text
canCreateStudent
createStudentPermission
student_create
```

---

# Guards

Authorization must use permissions.

Good:

```typescript
@RequirePermissions('students.create')
```

Bad:

```typescript
if (user.role === 'Admin')
```

Never hardcode role names in business logic.

---

# Audit Log Integration

All sensitive actions must create audit logs.

Examples:

```text
User Login

User Logout

Role Created

Role Updated

Permission Assigned

User Deactivated
```

---

# Golden Rules

1. User is an account.
2. Profile stores personal information.
3. Authentication and Authorization are separate.
4. Roles represent job functions.
5. Permissions represent actions.
6. Business modules must check permissions, not roles.
7. Never hardcode role names in services.
8. Every role belongs to an organization.
9. Use many-to-many relationships for roles and permissions.
10. IAM must be completed before Academic modules.
