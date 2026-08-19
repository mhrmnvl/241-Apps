-- Split `inventory.*` into four areas, carrying every existing grant across.
--
-- One module could not express the arrangement the school runs. The inventory
-- administrator keeps the register and signs the loans; a teacher only borrows.
-- Under `inventory.create`, giving a teacher enough to request a projector also
-- let them add assets and define approval workflows — so the permission had to
-- be split before an inventory administrator could mean anything.
--
-- The mapping preserves what each role could already do, area by area. Two
-- things about it are deliberate:
--
--   * `inventory.read` becomes read on assets, loans, and reference data — but
--     *not* on approvals. The approval queue is only useful to someone who can
--     act on it, so it follows `inventory.update` instead. In practice this is
--     the teacher role in development: it keeps everything it was using and
--     loses a queue it could never process.
--
--   * The old four codes are deleted at the end. The bootstrap sync only ever
--     upserts, so a code dropped from the catalogue would otherwise linger in
--     the UI as something an administrator can still grant while it guards no
--     endpoint at all — the worst kind of permission, one that looks like
--     access and is not.
--
-- Written so it can run on a database that has none of this: an empty
-- permissions table produces no rows and no error.

-- 1. The new permissions. The bootstrap sync would create these on the next
--    boot anyway, but the grants below need them to exist *now*, and its upsert
--    makes doing it twice harmless.
INSERT INTO "permissions" ("id", "module", "action", "code", "description", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'inventory-assets', 'create', 'inventory-assets.create', 'Add assets and asset units to the register', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-assets', 'read', 'inventory-assets.read', 'Read the asset register', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-assets', 'update', 'inventory-assets.update', 'Update assets and asset units', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-assets', 'delete', 'inventory-assets.delete', 'Delete assets and asset units', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-loans', 'create', 'inventory-loans.create', 'Request a loan — what a borrower needs, and all they need', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-loans', 'read', 'inventory-loans.read', 'Read loan transactions and the circulation history', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-loans', 'update', 'inventory-loans.update', 'Record the return of borrowed assets', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-approvals', 'create', 'inventory-approvals.create', 'Define who approves a loan, and in what order', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-approvals', 'read', 'inventory-approvals.read', 'Read the approval queue and the workflows behind it', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-approvals', 'update', 'inventory-approvals.update', 'Approve or reject a loan request', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-master-data', 'create', 'inventory-master-data.create', 'Create inventory categories, locations, conditions, statuses', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-master-data', 'read', 'inventory-master-data.read', 'Read inventory reference data', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-master-data', 'update', 'inventory-master-data.update', 'Update inventory reference data', NOW(), NOW()),
  (gen_random_uuid(), 'inventory-master-data', 'delete', 'inventory-master-data.delete', 'Delete inventory reference data', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- 2. Carry the grants across, one old code to its successors.
--
--    `role_permissions` has no id column — its primary key is the pair — so the
--    conflict target is (role_id, permission_id). A role that somehow already
--    holds one of the new codes keeps it rather than failing the migration.
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT rp."role_id", new_p."id"
FROM "role_permissions" rp
JOIN "permissions" old_p ON old_p."id" = rp."permission_id"
JOIN "permissions" new_p ON new_p."code" = ANY (
  CASE old_p."code"
    WHEN 'inventory.read' THEN ARRAY[
      'inventory-assets.read',
      'inventory-loans.read',
      'inventory-master-data.read'
    ]
    WHEN 'inventory.create' THEN ARRAY[
      'inventory-assets.create',
      'inventory-loans.create',
      'inventory-approvals.create',
      'inventory-master-data.create'
    ]
    WHEN 'inventory.update' THEN ARRAY[
      'inventory-assets.update',
      'inventory-loans.update',
      'inventory-approvals.read',
      'inventory-approvals.update',
      'inventory-master-data.update'
    ]
    WHEN 'inventory.delete' THEN ARRAY[
      'inventory-assets.delete',
      'inventory-master-data.delete'
    ]
    ELSE ARRAY[]::text[]
  END
)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- 3. Retire the old codes. The cascade on role_permissions removes the grants
--    with them, which is why step 2 has to come first.
DELETE FROM "permissions"
WHERE "code" IN (
  'inventory.create',
  'inventory.read',
  'inventory.update',
  'inventory.delete'
);
