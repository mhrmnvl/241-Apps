# School Hub Authentication Strategy

## Purpose

This document defines the authentication strategy for School Hub.

The authentication system must support:

- Multi-Tenant Architecture
- Multi-School Organizations
- Custom Domains
- Single Login Portal
- Students
- Teachers
- Employees
- Parents
- Administrators

---

# Core Principle

Authentication must be tenant-aware.

A user identity only needs to be unique inside a School Unit.

Global username uniqueness is not required.

---

# Tenant Resolution

School Hub supports:

## Managed Subdomains

```text
mtsalikhlash.schoolhub.id
smpabc.schoolhub.id
smkxyz.schoolhub.id
```

## Custom Domains

```text
siakad.mtsalikhlash.sch.id
portal.smpabc.sch.id
school.smakarya.id
```

---

# Authentication Flow

```text
Request

↓

Host Header

↓

School Unit Resolution

↓

Tenant Context

↓

Authentication
```

The active School Unit is determined from the domain.

---

# Login Screen

Single login page.

```text
Identifier
Password
```

No role selection is required.

No school selection is required.

The domain already identifies the tenant.

---

# Identifier Strategy

## Student

Identifier:

```text
NIS
```

Example:

```text
252608001
```

Constraint:

```text
Unique per School Unit
```

---

## Teacher

Identifier:

```text
Employee Number
```

or

```text
NIP
```

Example:

```text
1987654321
```

Constraint:

```text
Unique per School Unit
```

---

## Employee

Identifier:

```text
Employee Number
```

Constraint:

```text
Unique per School Unit
```

---

## Parent

Identifier:

```text
Phone Number
```

Example:

```text
081234567890
```

Constraint:

```text
Unique per School Unit
```

---

## Administrator

Identifier:

```text
Username
```

Examples:

```text
admin
operator
principal
```

Constraint:

```text
Unique per School Unit
```

---

# User Entity

Authentication account only.

```typescript
User;
{
  id;

  organizationId;
  schoolUnitId;

  identifier;

  passwordHash;

  isActive;

  lastLoginAt;

  createdAt;
  updatedAt;
}
```

---

# Domain Ownership

Authentication data must not duplicate business data.

Examples:

```text
Student
 └── NIS

Employee
 └── Employee Number

Parent
 └── Phone Number
```

User only stores the login identifier.

---

# Uniqueness Rules

Students:

```text
schoolUnitId + nis
```

Teachers:

```text
schoolUnitId + employeeNumber
```

Users:

```text
schoolUnitId + identifier
```

Global uniqueness is not required.

---

# Authorization

Authentication identifies the user.

Authorization determines permissions.

Authentication:

```text
Who are you?
```

Authorization:

```text
What are you allowed to do?
```

Authorization must be implemented through:

```text
User
Role
Permission
```

Never through hardcoded role names.

---

# Golden Rules

1. Authentication is tenant-aware.
2. Domains determine School Unit context.
3. Students use NIS.
4. Teachers use Employee Number or NIP.
5. Parents use Phone Number.
6. Administrators use Username.
7. Global usernames are not required.
8. Custom domains are supported.
9. Authentication and Authorization are separate concerns.
10. Every login belongs to a School Unit.
