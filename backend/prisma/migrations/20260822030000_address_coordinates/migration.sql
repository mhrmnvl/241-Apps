-- The school's coordinate moves from school_units to addresses. This is the
-- half that adds; 20260822031000 drops the old columns.
--
-- 20260819140000_school_unit_coordinates put the pin on school_units, reasoning
-- that the shared addresses table would gain two columns no student, teacher or
-- parent needs. Two things were wrong with that.
--
-- The first is that a coordinate is a property of a place, and the place is the
-- address — the pin is the machine-readable form of the same fact the street
-- line states in words. school_units.addresses is a list, so a coordinate on
-- the unit cannot say which of its addresses it pins.
--
-- The second is the claim that nobody else needs one. Zonasi is a distance from
-- a student's home to the school, and this system has an admission domain. The
-- columns are nullable and nothing reads a student's yet, but the door is now
-- the right shape.
--
-- Double precision, not numeric — a coordinate has none of money's duty to keep
-- every cent, double carries far more digits than the ~9 a WGS84 pin needs, and
-- Prisma hands numeric back as a Decimal that serialises to a string. Range is
-- enforced at the DTO (-90..90, -180..180) rather than by a CHECK, so the one
-- place a bad coordinate is rejected is the place that explains why.
ALTER TABLE "addresses"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;

-- Carry forward whatever was already pinned.
--
-- One address per school unit receives it: the primary if there is one, and
-- failing that the oldest surviving row, because losing a coordinate somebody
-- typed is worse than putting it on the only address available. The read rule
-- is stricter and deliberately so — the map shows the primary address or
-- nothing — but that is a rule about what to display, not a licence to drop
-- data on the way past.
UPDATE "addresses" AS a
SET "latitude" = src."latitude",
    "longitude" = src."longitude"
FROM (
  SELECT DISTINCT ON (addr."school_unit_id")
         addr."id" AS address_id,
         su."latitude",
         su."longitude"
  FROM "addresses" AS addr
  JOIN "school_units" AS su ON su."id" = addr."school_unit_id"
  WHERE addr."deleted_at" IS NULL
    AND su."latitude" IS NOT NULL
    AND su."longitude" IS NOT NULL
  ORDER BY addr."school_unit_id", addr."is_primary" DESC, addr."id"
) AS src
WHERE a."id" = src.address_id;
