-- Reference rows the presence domain needs to function, as a data migration
-- rather than a seed.
--
-- Seeds are a development convenience and must not run against production, but
-- two of these rows are not optional: without a default work pattern every scan
-- resolves to NOT_EXPECTED, because nobody can be judged late against hours no
-- one defined. A data migration ships them through `prisma migrate deploy`,
-- which is the only thing production runs.
--
-- Every statement is guarded, so this is safe on a database where the seed
-- already inserted the same rows.

-- The school-wide default working pattern.
-- Friday ends early for Jumat prayers; Sunday is not a working day; Saturday is,
-- which is the norm for an Indonesian madrasah rather than an inherited default.
WITH inserted_pattern AS (
  INSERT INTO "work_patterns" ("id", "name", "is_default", "grace_minutes", "created_at", "updated_at")
  SELECT gen_random_uuid(), 'Standar', true, 10, NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM "work_patterns" WHERE "is_default" = true AND "deleted_at" IS NULL
  )
  RETURNING "id"
)
INSERT INTO "work_pattern_days" ("id", "work_pattern_id", "weekday", "is_working_day", "start_time", "end_time")
SELECT gen_random_uuid(), inserted_pattern."id", day."weekday", day."is_working_day", day."start_time", day."end_time"
FROM inserted_pattern
CROSS JOIN (VALUES
  (0, false, '07:00', '14:00'),
  (1, true,  '07:00', '14:00'),
  (2, true,  '07:00', '14:00'),
  (3, true,  '07:00', '14:00'),
  (4, true,  '07:00', '14:00'),
  (5, true,  '07:00', '11:30'),
  (6, true,  '07:00', '14:00')
) AS day("weekday", "is_working_day", "start_time", "end_time");

-- A starting set of leave types. Unlike the work pattern these are genuinely the
-- school's to own — they are editable and removable through master data, and
-- this only guarantees the list is not empty on a fresh install.
--
-- DINAS_LUAR is OFFICIAL_DUTY rather than ON_LEAVE on purpose: the person is
-- working, just not at school, so it must not read as leave in a recap or cost
-- them an attendance-driven allowance.
INSERT INTO "leave_types" ("id", "code", "name", "treatment", "consumes_quota", "annual_quota", "requires_document", "applies_to", "is_active")
VALUES
  (gen_random_uuid(), 'IZIN',         'Izin',           'ON_LEAVE',      false, NULL, false, 'EMPLOYEE', true),
  (gen_random_uuid(), 'SAKIT',        'Sakit',          'ON_LEAVE',      false, NULL, false, 'EMPLOYEE', true),
  (gen_random_uuid(), 'CUTI_TAHUNAN', 'Cuti Tahunan',   'ON_LEAVE',      true,  12,   false, 'EMPLOYEE', true),
  (gen_random_uuid(), 'DINAS_LUAR',   'Dinas Luar',     'OFFICIAL_DUTY', false, NULL, true,  'EMPLOYEE', true),
  (gen_random_uuid(), 'SAKIT_SISWA',  'Sakit (Siswa)',  'ON_LEAVE',      false, NULL, false, 'STUDENT',  true),
  (gen_random_uuid(), 'IZIN_SISWA',   'Izin (Siswa)',   'ON_LEAVE',      false, NULL, false, 'STUDENT',  true)
ON CONFLICT ("code") DO NOTHING;
