-- Rename `approver_role_id` to `approver_role_code`, because that is what it
-- holds.
--
-- The column is VarChar(50) and stores a role code — 'ADMIN', 'PRINCIPAL' — not
-- a uuid. `ProcessApprovalUseCase` compares it against the caller's role codes,
-- which is correct, and the name is the only thing that is wrong.
--
-- That mattered more than a tidy-up. The next reader to notice an `...Id` column
-- holding a string would have "fixed" it to a uuid foreign key, at which point
-- the comparison stops matching for everyone and every approval fails — silently,
-- since a refused approval reads like a permissions problem.
--
-- No data is at risk: both databases hold zero approval steps today.
ALTER TABLE "approval_steps"
  RENAME COLUMN "approver_role_id" TO "approver_role_code";
