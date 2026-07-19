# School Hub Platform IAM Domain Model

## Overview

This document defines the domain model for the Platform Layer of School Hub.

The Platform Layer is the foundation of the entire system and must be implemented before Academic, Finance, Admissions, Library, or any other business domain.

The purpose of this layer is to provide:

- Authentication
- Authorization
- Multi-Tenant Management
- Organization Management
- School Unit Management
- User Management
- Session Management
- Audit Logging

---

# Platform Domain Architecture

```text
Platform
│
├── Organizations
├── School Units
├── Users
├── Profiles
├── Roles
├── Permissions
├── Sessions
├── Audit Logs
└── Authentication
```

---

# Multi-Tenant Hierarchy

School Hub supports multi-tenant architecture.

Hierarchy:

```text
Organization
    │
    ├── School Unit
    ├── School Unit
    └── School Unit
```

Example:

```text
Yayasan Pendidikan ABC
│
├── SMP ABC
├── SMA ABC
└── SMK ABC
```

All business data belongs to a School Unit.

Every School Unit belongs to an Organization.

---

# Organization

Represents the legal owner of one or more school units.

Examples:

- Foundation
- Education Group
- School Operator
- Educational Institution

---

## Organization Entity

```typescript
Organization;
{
  id;

  name;
  code;

  email;
  phoneNumber;

  isActive;

  createdAt;
  updatedAt;
  deletedAt;
}
```

---

# School Unit

Represents an individual school.

Examples:

- SMP ABC
- SMA ABC
- SMK ABC

---

## SchoolUnit Entity

```typescript
SchoolUnit;
{
  id;

  organizationId;

  name;
  code;

  level;

  npsn;

  email;
  phoneNumber;

  isActive;

  createdAt;
  updatedAt;
  deletedAt;
}
```

---

# User

Represents an account that can access School Hub.

A User is not a Student.

A User is not a Teacher.

A User is not an Employee.

A User is only a system account.

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
  deletedAt;
}
```

---

# Profile

Stores personal information related to a User.

Profile data must be separated from User credentials.

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

# Session

Stores authenticated user sessions.

Used for:

- Refresh Tokens
- Device Tracking
- Login History
- Session Revocation

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

  lastUsedAt;

  revokedAt;

  createdAt;
}
```

---

# Role

Represents a job function or responsibility.

Examples:

```text
Super Admin
Organization Owner
School Admin
Principal
Teacher
Student
Parent
Finance Staff
```

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

# Permission

Represents an action that can be performed.

Permissions are assigned to roles.

Users inherit permissions through roles.

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

  createdAt;
  updatedAt;
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

# UserRole

Many-to-many relationship between Users and Roles.

A user may have multiple roles.

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

# RolePermission

Many-to-many relationship between Roles and Permissions.

A role may contain many permissions.

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

# Audit Log

Stores all security-sensitive activities.

Audit logs are immutable.

Records must never be edited.

---

## AuditLog Entity

```typescript
AuditLog;
{
  id;

  organizationId;

  userId;

  action;

  resource;

  resourceId;

  metadata;

  ipAddress;

  userAgent;

  createdAt;
}
```

---

# Authentication Flow

```text
User
    │
    ├── Login
    │
    ├── Access Token
    │
    └── Refresh Token
            │
            └── Session
```

---

# Authorization Flow

```text
User
    │
    ▼

UserRole

    │
    ▼

Role

    │
    ▼

RolePermission

    │
    ▼

Permission
```

Example:

```text
John Doe

→ School Admin

→ users.read
→ users.create
→ students.read
→ students.create
→ students.update
```

---

# User Classification

Do not use User.role enum.

Avoid:

```typescript
enum UserRoleType {
    ADMIN
    EMPLOYEE
    STUDENT
}
```

Reason:

The system already uses:

```text
User
Role
Permission
```

Using both creates duplicated authorization logic.

Authorization must be controlled through Roles and Permissions only.

---

# Domain Relationships

```text
Organization
│
├── SchoolUnit
│
├── User
│   ├── Profile
│   ├── Session
│   └── UserRole
│
├── Role
│   └── RolePermission
│
├── Permission
│
└── AuditLog
```

---

# Future Integrations

The Platform Layer will become the foundation for:

```text
Academic
Finance
Admissions
Library
Human Resources
Inventory
Learning Management
```

All business domains must depend on Platform.

Platform must never depend on business domains.

---

# Golden Rules

1. User is an account.
2. Profile stores personal information.
3. Authentication and Authorization are separate concerns.
4. Roles represent responsibilities.
5. Permissions represent actions.
6. Authorization must use permissions.
7. Never hardcode role names in business logic.
8. Every School Unit belongs to an Organization.
9. Every business entity must support tenancy.
10. Platform is the foundation of the entire School Hub ecosystem.
