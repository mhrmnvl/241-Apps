# No shared transaction across the Student → Enrollment write sequence

**Context**: `ResolveBulkImportConflictsUseCase` (student and teacher) resolves a conflict row via multiple sequential, independently-awaited writes with no wrapping transaction — e.g. student's update branch calls `UpdateStudentUseCase.execute()`, then `UpdateStudentProfileUseCase.execute()`, then conditionally `EnsureStudentEnrollmentUseCase.execute()` (a cross-module call into `EnrollmentModule`, per ADR-0002). If a later step fails, earlier writes are not rolled back. An architecture review flagged this as a possible correctness gap and proposed wrapping the sequence in a `prisma.$transaction`.

**Decision**: do not add a transaction across this sequence. Leave each step as an independent, awaited call, exactly as it is today.

**Why**:

- **Prisma's own guidance is to keep interactive transactions short and free of branching, cross-function indirection** ("avoid network requests and slow queries within transaction functions ... keep them short to avoid performance issues and deadlocks" — Prisma docs, Transactions and batch queries). `EnsureStudentEnrollmentUseCase` alone is not one query — it's `findActive` → `findDuplicate` → a branch into `CreateStudentEnrollmentUseCase` or `TransferStudentUseCase`, each with its own validation. Threading a transaction client through that whole chain (or duplicating it inline, mirroring `ProcessApprovalUseCase`'s pattern of raw `tx.model.x()` calls) means an interactive transaction spanning several dependent queries and at least one more branch — precisely what Prisma recommends against.
- **Student and Enrollment are separate aggregates in separate modules**, a boundary ADR-0002 already established deliberately. DDD's consistency rule is immediate consistency *within* an aggregate, eventual consistency *between* aggregates — forcing a shared transaction across this seam contradicts that boundary rather than reinforcing it.
- **Modular-monolith resilience**: a shared transaction across `StudentModule` and `EnrollmentModule` means a failure on the Enrollment side rolls back a Student-side write — the module boundary stops being a boundary. One of this codebase's own guiding principles is that failures in one module must not cascade into another.
- **Every step in the sequence is idempotent and safe to retry.** `UpdateStudentUseCase`/`UpdateStudentProfileUseCase` re-apply the same field values on retry; `EnsureStudentEnrollmentUseCase` is explicitly designed to no-op if the student is already correctly enrolled. A failure partway through does not corrupt data — it leaves some fields not-yet-updated, which resubmitting the same conflict-resolution row corrects. The failure is not silently lost either: `processBulkImportConflicts` (the shared loop-control helper both entities' `ResolveBulkImportConflictsUseCase` use) already surfaces it in that row's `errors[]`, so the caller knows to retry.

## Considered Options

- Thread an optional `Prisma.TransactionClient` through `UpdateStudentUseCase`, `UpdateStudentProfileUseCase`, `EnsureStudentEnrollmentUseCase`, and the enrollment use-cases/repositories it calls — rejected: touches 8-10 files across two modules to harden a low-volume admin/bulk-import code path, and produces exactly the long, branching interactive transaction Prisma's own docs warn against.
- Inline the whole sequence as raw `tx.model.x()` calls inside `ResolveBulkImportConflictsUseCase`, mirroring `ProcessApprovalUseCase` — rejected: would re-duplicate the NIS/NISN and not-found checks, and the entire create-vs-transfer decision tree that ADR-0002 deliberately consolidated into `EnsureStudentEnrollmentUseCase` to stop duplicating it.
- Wrap only `UpdateStudentUseCase` + `UpdateStudentProfileUseCase` (same aggregate, same module) in a transaction, leaving the enrollment call outside it — technically clean, but both writes are already idempotent on retry, so the added transaction handling did not pay for itself.

## Consequences

- A partial write across this sequence remains possible in principle, but is not a data-corruption risk: every step is idempotent, and the failure is already visible in the per-row error, not swallowed.
- Future multi-step sequences that cross a module boundary (any `*Module` seam, not just Student/Enrollment) should default to this same reasoning: only reach for a transaction when the steps are same-aggregate/same-module *and* not already safe to retry independently. Don't add one just because "multiple writes" pattern-matches a database best-practices rule.
