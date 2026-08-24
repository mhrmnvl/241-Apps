-- Where the school sits, for the map on its profile.
--
-- The address has always been text — street, RT/RW, village, district, city.
-- That is what a letter needs, and it is not what a map needs: no amount of
-- parsing turns "Jl. Pesantren No. 2" into a pin you can trust.
--
-- On school_units rather than addresses, deliberately. The addresses table is
-- shared by students, teachers, parents and the school, and none of the first
-- three needs a coordinate; putting the columns there would widen a row that
-- every roster read already touches.
--
-- Double precision, not numeric. Numeric is the right answer for money, where a
-- binary fraction eventually loses a cent; a coordinate has no such duty, and
-- double carries far more digits than the ~9 a WGS84 pin needs. It also reaches
-- the client as a JSON number — Prisma hands back numeric as a Decimal that
-- serialises to a string, which every caller would then have to coerce.
--
-- Range is enforced at the DTO (-90..90, -180..180) rather than by a CHECK, to
-- keep the one place a bad coordinate can be rejected the same place that
-- returns the message explaining why.
--
-- Nullable with no backfill. The school existed long before anyone recorded a
-- coordinate, and a profile with no pin is a normal state the page renders as
-- such, not a broken one. Inventing 0,0 would put the school in the Atlantic.
ALTER TABLE "school_units"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;
