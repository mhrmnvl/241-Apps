-- The other half of the move begun in 20260822030000.
--
-- Separated so that neither direction has a broken window. Adding the new
-- columns and copying the data leaves the old ones in place, which the
-- already-deployed backend still reads — so that half is safe to run before the
-- new code is live. Dropping is not, and waits here for after.
--
-- Prisma applies both in one `migrate deploy`, which is correct once the new
-- code is running. Applying only the first is also valid, and is what to do if
-- these ever need to go out ahead of a deployment.
ALTER TABLE "school_units"
  DROP COLUMN "latitude",
  DROP COLUMN "longitude";
