# Specification Quality Checklist: Separate the student surface from the management surface

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-14
**Feature**: [spec.md](../spec.md)

## Content Quality

- [X] No implementation details (languages, frameworks, APIs)
- [X] Focused on user value and business needs
- [X] Written for non-technical stakeholders
- [X] All mandatory sections completed

## Requirement Completeness

- [X] No [NEEDS CLARIFICATION] markers remain
- [X] Requirements are testable and unambiguous
- [X] Success criteria are measurable
- [X] Success criteria are technology-agnostic (no implementation details)
- [X] All acceptance scenarios are defined
- [X] Edge cases are identified
- [X] Scope is clearly bounded
- [X] Dependencies and assumptions identified

## Feature Readiness

- [X] All functional requirements have clear acceptance criteria
- [X] User scenarios cover primary flows
- [X] Feature meets measurable outcomes defined in Success Criteria
- [X] No implementation details leak into specification

## Notes

Two things were deliberately kept out of the spec and are recorded here instead,
because they are how the work will be done rather than what it must achieve:

- The permission naming and endpoint shape follow the presence precedent
  (`leave-requests.read-own`, `GET /presence/leave-requests/me`). The spec states
  the rule — a self-authorization distinct from the management one — and leaves
  the naming to planning.
- FR-006 exists because production will not run seeds. It is a requirement, not
  a mechanism: the spec does not say "migration", only that the authorization
  must arrive without one being run and must be grantable through the role
  screen.

Four questions were resolved as documented assumptions rather than raised as
clarifications, because each has a defensible default and none changes the shape
of the work:

- published-only report cards
- "Nilai" as per-assessment marks rather than a second summary
- parents out of scope
- teachers keep the management screens for work they do to others' records

One is worth revisiting at planning: FR-003 refuses a class recap to a student.
A student arguably has a legitimate interest in their own attendance percentage,
which is a statement about them derived from their own rows. The spec covers
that under their own attendance totals (User Story 2, scenario 2) rather than
through the recap, so the two do not conflict — but the boundary is worth
confirming when the read is designed.
