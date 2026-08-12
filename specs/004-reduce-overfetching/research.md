# Research: Fetch Only What Is Shown

**Feature**: `004-reduce-overfetching` | **Date**: 2026-08-12

All findings below were measured against the code, not inferred from the audits.

---

## R1. One shared shape is not enough — three are

**Decision**: Define three person shapes, not the single `PROFILE_NAME_SELECT` the backend audit proposes.

**Rationale**: The audit's table asserts "`name` saja" for 14 of its 15 rows. That is false for four of them. Grepping every read of a profile field in the frontend shows what list screens actually display:

| Screen | Fields read |
|---|---|
| `student/components/columns.ts` | `name`, **`gender`** |
| `teacher/components/columns.ts` | `name`, **`nik`**, **`gender`** |
| `classroom/components/enrollment-columns.ts` | `name`, **`gender`** |
| `classroom/components/AddStudentDialog.vue` | `name`, **`gender`** |
| Every app's `AppLayout.vue` | `name`, **`avatar`** |
| Everything else (57 reads) | `name` |

Replacing all 19 sites with `{ name: true }` would silently remove four visible columns and every avatar. That directly violates FR-013.

The three shapes:

- **Name only** — `{ name }`. The majority: schedule, attendance, assessment, report card, graduation, classroom supervisor and structure, admission, portal author, presence.
- **Display** — `{ name, avatarFile: { select: { storageKey: true } } }`. Where a face is drawn. Note this is a *relation*, not `avatarFileId`: the browser receives a signed URL produced by `withAvatarUrl`, which reads `avatarFile.storageKey`. Selecting the id alone would break every avatar.
- **Roster** — `{ name, gender, nik }`. The student, teacher and enrollment lists above.

**Alternatives considered**:
- *One shape with every field any screen needs* (`name, gender, nik, avatarFile`) — rejected: it makes the roster's extra columns the default everywhere, which is the problem restated with a smaller constant.
- *A shape per call site* — rejected: it is what exists today, and it is why the same decision was re-made 19 times.

---

## R2. The exemplar already exists in this repo

**Decision**: Follow `payroll/payslip`'s pattern exactly.

**Rationale**: `prisma-payslip.repository.ts` already does what this feature needs, and the audit named it exemplary:

```ts
const EMPLOYEE_SELECT = {
  select: { id: true, identifier: true, profile: { select: { name: true } } },
} satisfies Prisma.UserDefaultArgs;
```

`satisfies Prisma.UserDefaultArgs` is the load-bearing part: it type-checks the shape against the schema while keeping the literal type, so `Prisma.PayslipGetPayload<{ include: typeof … }>` still infers exact field types. A plain `as const` loses that check; a bare object loses the inference.

**Alternatives considered**: `as const` (used by `teacher/USER_SELECT` today) — rejected: it does not verify the fields exist, so a typo surfaces as a runtime Prisma error rather than a compile error.

---

## R3. Where the shapes live

**Decision**: `backend/src/shared/domain/prisma-selects.ts`, one file, exporting the three shapes.

**Rationale**: The constitution permits `shared/` to hold "helpers, types, enums, constants, and utils — never business logic". A select shape is a constant describing a projection; it encodes no rule. `shared/domain/` already holds cross-domain enums and entities, so the neighbours are right.

Putting it in `platform/profile` instead would invert the dependency: `academic`, `admission`, `inventory`, `portal` and `presence` would each import from a sibling feature module to read a name.

**Alternatives considered**: a file per domain — rejected: five copies of the same three constants is the duplication this feature exists to remove.

---

## R4. Frontend reuse — a shared store, not a query library

**Decision**: A reference-data store in `@241/platform`, with per-list expiry. Do **not** add TanStack Query in this feature.

**Rationale**: The constitution requires justification for a cross-cutting dependency, and the justification does not hold here:

- The requirement (FR-009 to FR-011) is "retrieve once per visit, expire after a stated period, invalidate on write". Pinia does this in roughly a hundred lines.
- TanStack Query is a large surface — query keys, `staleTime`/`gcTime`, invalidation, devtools, SSR concerns — introduced across five applications at once, when what is needed is a cache for ten lists.
- Every existing feature already coordinates through Pinia. Introducing a second, parallel async-state mechanism means two ways to fetch, and reviewers having to know which applies where.
- It can be adopted later without undoing this work: the store is an implementation detail behind a composable, and swapping the internals is a contained change.

**Alternatives considered**:
- *TanStack Query now* — rejected above. Recorded as the upgrade path if reference data grows to need request deduplication, background refetch or optimistic updates.
- *Per-feature caching* — rejected: it is the current state, and it is why the same list is fetched four times across four pages.

---

## R5. The 42-file reference-limit pattern is mostly fine

**Decision**: Move only the reads that feed dialogs. Leave the rest.

**Rationale**: 42 files use `PAGINATION.REFERENCE_LIMIT`. Most fill a filter or a select that the screen shows immediately — those are correctly eager. The waste is the subset fetched on page load for a dialog that may never open. The audit named one (`CurriculumSubjectView` → 1,000 subjects); the plan's first task is to enumerate the rest rather than assume it is the only one.

**Alternatives considered**: converting every picker to server-side search — rejected: it is a larger, user-visible change (typing to search rather than scrolling), and it belongs in its own feature. The spec records it as out of scope.

---

## R6. Baseline before change

**Decision**: Capture request count and payload size for six named screens before any edit, and re-measure after.

**Rationale**: SC-002 to SC-004 are relative ("fewer than before"), which is unverifiable without a before. The six: student list, teacher list, schedule, classroom manage, curriculum subject, and cold-start sign-in.

**Alternatives considered**: absolute targets — rejected: no baseline exists to set them from, and inventing one would make the criterion arbitrary rather than measurable.

---

## R7. What is *not* changing

- `report-card-pdf.template.ts` and other rendered documents — untouched by this feature.
- The `Max(1000)` reference cap — see R5.
- The profile detail screen's data — it legitimately reads the whole record. Splitting `USER_DETAIL_SELECT` (audit K-1) is in scope, but its *response* must stay compatible; only the number of queries behind it changes.
