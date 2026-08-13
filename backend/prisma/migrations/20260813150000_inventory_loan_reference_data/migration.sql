-- Reference rows the inventory loan lifecycle binds to by code, as a data
-- migration rather than a seed.
--
-- 20260722000000_inventory_status_system_key added the `system_key` column and
-- deliberately left every existing row NULL, on the plan that an admin would
-- assign each role through Referensi > Status Aset. That never happened — and
-- for the transaction types it could not have: inventory-web renders them in
-- the circulation history and offers no screen to create one.
--
-- So the live database holds one status (TERSEDIA, no role) and no transaction
-- types at all, while approve, reject and return each begin by looking up a row
-- by `system_key` or by `code`. Every one of those paths fails today.
--
-- Two rules this follows:
--
--   * It adopts rather than duplicates. 537 asset units point at TERSEDIA; a
--     fresh AVAILABLE row would leave every one of them sitting on a status the
--     code does not recognise, which is worse than the current failure because
--     it looks like it worked.
--   * It never overrides a role someone already assigned. Every statement is
--     guarded on the role still being absent, so this is a no-op against a
--     database that is already configured, and safe to run on both boxes.

-- 1. Adopt an existing "available" status rather than creating a rival.
--    Matched on the codes this school and the old seed actually used.
UPDATE "inventory_statuses"
SET "system_key" = 'AVAILABLE'
WHERE "id" = (
        SELECT "id"
        FROM "inventory_statuses"
        WHERE "system_key" IS NULL
          AND UPPER("code") IN ('STAT-AVAIL', 'TERSEDIA', 'AVAILABLE')
        ORDER BY "created_at"
        LIMIT 1
      )
  AND NOT EXISTS (
        SELECT 1 FROM "inventory_statuses" WHERE "system_key" = 'AVAILABLE'
      );

-- 2. A row already carrying the canonical code, but no role, gets its role.
UPDATE "inventory_statuses" s
SET "system_key" = w."key"::"InventoryStatusKey"
FROM (VALUES
  ('STAT-AVAIL',         'AVAILABLE'),
  ('STAT-LOAN-PENDING',  'LOAN_PENDING'),
  ('STAT-LOAN-APPROVED', 'LOAN_APPROVED'),
  ('STAT-LOANED',        'LOANED'),
  ('STAT-LOAN-RETURNED', 'LOAN_RETURNED'),
  ('STAT-LOAN-REJECTED', 'LOAN_REJECTED')
) AS w("code", "key")
WHERE s."code" = w."code"
  AND s."system_key" IS NULL
  AND NOT EXISTS (
        SELECT 1
        FROM "inventory_statuses" x
        WHERE x."system_key" = w."key"::"InventoryStatusKey"
      );

-- 3. Whatever role is still unfilled gets a status of its own.
--    Names are Indonesian because these are master data the school reads and
--    relabels; only the code and the role are load-bearing.
INSERT INTO "inventory_statuses" ("id", "code", "name", "allow_transactions", "system_key", "created_at")
SELECT gen_random_uuid(), w."code", w."name", w."allow", w."key"::"InventoryStatusKey", NOW()
FROM (VALUES
  ('STAT-AVAIL',         'Tersedia',               true,  'AVAILABLE'),
  ('STAT-LOAN-PENDING',  'Menunggu Persetujuan',   false, 'LOAN_PENDING'),
  ('STAT-LOAN-APPROVED', 'Peminjaman Disetujui',   false, 'LOAN_APPROVED'),
  ('STAT-LOANED',        'Sedang Dipinjam',        false, 'LOANED'),
  ('STAT-LOAN-RETURNED', 'Selesai (Dikembalikan)', false, 'LOAN_RETURNED'),
  ('STAT-LOAN-REJECTED', 'Peminjaman Ditolak',     false, 'LOAN_REJECTED')
) AS w("code", "name", "allow", "key")
WHERE NOT EXISTS (
        SELECT 1
        FROM "inventory_statuses" s
        WHERE s."system_key" = w."key"::"InventoryStatusKey"
      )
  AND NOT EXISTS (
        SELECT 1 FROM "inventory_statuses" s WHERE s."code" = w."code"
      );

-- 4. The transaction types. Unlike the statuses there is no screen to create
--    these, so this migration is the only thing that can put them there.
--
--    TX-LOAN-CANCEL exists because a rejection is not a return: the unit never
--    left the building, so recording it as an inbound movement would overstate
--    what happened. Direction NONE says exactly that.
INSERT INTO "inventory_transaction_types" ("id", "code", "name", "direction", "description", "created_at")
VALUES
  (gen_random_uuid(), 'TX-LOAN-OUT',    'Pinjam Keluar',      'OUT',  'Unit keluar karena peminjaman disetujui', NOW()),
  (gen_random_uuid(), 'TX-LOAN-IN',     'Kembali Masuk',      'IN',   'Unit kembali karena pinjaman dikembalikan', NOW()),
  (gen_random_uuid(), 'TX-LOAN-CANCEL', 'Peminjaman Ditolak', 'NONE', 'Unit kembali tersedia karena pengajuan ditolak; tidak ada perpindahan fisik', NOW())
ON CONFLICT ("code") DO NOTHING;
