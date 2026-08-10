# Specification Quality Checklist: QR Card Attendance, Leave & Payroll

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-10
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

**Status: all 16 items pass.** Validated over three iterations on 2026-08-10, then amended by
the `/speckit-analyze` remediation pass the same day.
61 functional requirements (FR-001–FR-061, contiguous), 17 success criteria
(SC-001–SC-017, contiguous), 6 prioritised user stories.

### Iteration 1 — issues found and fixed

- *Content Quality — implementation detail leak*: the first draft named a specific
  backend domain folder and a specific frontend feature path in Assumptions. Replaced
  with the outcome-level statement (student attendance stays with the teachers who
  correct it; employee attendance is its own domain; no dedicated application), with
  the structural decision explicitly deferred to `/speckit-plan` plus an ADR, as the
  constitution's "Adding a New App" section requires.
- *Requirements testable*: FR-006 said a repeat scan is ignored "if too soon" —
  unmeasurable. Restated as same-event treatment within a short interval, with the
  interval a planning parameter, and Acceptance Scenario 1.6 pinning the observable
  behaviour (no second record, no overwrite of arrival).
- *Scope bounded*: payment execution was ambiguous. Now explicitly excluded.

### Iteration 2 — clarifications resolved by the requester

Both open markers were answered directly rather than deferred to `/speckit-clarify`:

- **Payroll depth → full payroll.** (The marker sat on the requirement now numbered
  **FR-040**; the payroll block was renumbered when it grew, so the original FR-050 label no
  longer points here.) The system computes the complete
  take-home amount — gaji pokok, tunjangan, potongan, net — and becomes the school's
  payroll source of truth. The payroll requirement block was rewritten and grew from
  11 requirements to 15, adding effective-dated salary assignments (FR-042), salary
  setting as a capability distinct from running payroll (FR-043), whole-rupiah
  rounding that reconciles to the net (FR-046), payslip content (FR-047), and an
  access trail over salary data (FR-052). User Story 6 gained four acceptance
  scenarios covering mid-month salary changes, the permission split, and rounding.
- **Employee coverage → every employee, roster-driven.** (Now **FR-055–FR-058**; the original
  FR-053 label was reused by the renumber.) The requester noted
  that positions in production are already selectable master data rather than
  hardcoded. Verified against the code: `Position` is master data under
  `backend/src/academic/master-data/position/`, and `position.seed.ts` only supplies
  initial values via the `SEED_POSITIONS` environment variable. This was turned into
  an explicit requirement (FR-056) so no future implementation gates attendance on a
  hardcoded position list, with SC-016 verifying it by adding a position after
  release.

### Iteration 3 — final sweep

Numbering verified contiguous after the renumber. No orphaned cross-references. No
clarification markers remain.

### Iteration 4 — `/speckit-analyze` remediation (2026-08-10)

Fifteen cross-artifact findings were raised and all fifteen fixed. Three touched this spec:

- **FR-061 added** (self-service visibility). `contracts/permissions.md` granted
  `presence-records.read-own` to every staff role, but no requirement, endpoint, or task
  existed behind it — a permission protecting nothing. An employee can now see their own
  attendance, which is also how a missing scan gets noticed on the day rather than at month
  end.
- **FR-011 given a data source.** The requirement distinguishes a genuine absence from a day
  outside someone's employment or enrolment, but the design deliberately blocks `presence/`
  from reading `academic/`, so nothing supplied that window. Resolved by making credential
  validity the window (research R1, data-model.md), which makes card issuance and revocation
  operationally load-bearing — stated rather than discovered later.
- **FR-037 annotated** as satisfied by the existing student recap rather than rebuilt here,
  with a verification task added instead of an implementation one.

Also corrected: SC-002 was sized against 400 people while the stated roll reaches ~660, and
the Assumptions allowed tablet-camera scanning that research R2 had already deferred.

### Recorded for planning, not blocking

These are decisions the spec deliberately defers rather than gaps in it:

1. **Where this ships.** The spec states the outcome (student attendance stays put,
   employee attendance is its own domain, no fifth application). The concrete
   structure requires an ADR at plan time.
2. **Every employee record currently requires a linked user account.** Recording
   satpam and petugas kebersihan therefore provisions accounts for people who may
   never sign in. Relax the constraint or create dormant accounts — a plan decision,
   captured in Assumptions.
3. **The roster is named "teacher" but already holds Bendahara and Staf TU**, and will
   hold satpam and petugas kebersihan. Renaming carries migration cost and is out of
   scope here.
4. **Static vs rotating QR code.** The spec assumes a static code printed once,
   mitigated by a supervised gate and correctable records. Rotating codes are a
   possible later hardening.
