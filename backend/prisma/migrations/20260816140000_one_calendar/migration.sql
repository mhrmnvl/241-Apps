-- One calendar.
--
-- The school had two: `academic_calendars`, which knows the academic year and
-- the term and carries an editable type, and `events`, which knew neither and
-- could be aimed at particular classes. They answered the same question — what
-- happens between these two dates — and the only thing that told a person which
-- to use was which menu entry they had clicked.
--
-- What the school actually describes is one calendar whose entries nest: a term
-- is a wide entry, and inside it sit the things that happen, some for everyone
-- and some for one class. That is `academic_calendars` plus the targeting
-- `events` had, so the targeting moves and `events` goes.
--
-- No data is at risk: both tables are empty on both boxes, and `audience_groups`
-- was reachable from nothing but events.
CREATE TABLE "academic_calendar_classrooms" (
  "id" UUID NOT NULL,
  "academic_calendar_id" UUID NOT NULL,
  "classroom_id" UUID NOT NULL,

  CONSTRAINT "academic_calendar_classrooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_calendar_classrooms_calendar_classroom_key"
  ON "academic_calendar_classrooms"("academic_calendar_id", "classroom_id");

CREATE INDEX "academic_calendar_classrooms_classroom_id_idx"
  ON "academic_calendar_classrooms"("classroom_id");

ALTER TABLE "academic_calendar_classrooms"
  ADD CONSTRAINT "academic_calendar_classrooms_calendar_id_fkey"
  FOREIGN KEY ("academic_calendar_id") REFERENCES "academic_calendars"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic_calendar_classrooms"
  ADD CONSTRAINT "academic_calendar_classrooms_classroom_id_fkey"
  FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- The second calendar, and everything that existed only to serve it.
DROP TABLE IF EXISTS "event_audiences";
DROP TABLE IF EXISTS "event_classes";
DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "audience_groups";

-- Its permissions go too. A code that guards no endpoint still appears on the
-- role screen, where it reads as access that can be granted and does nothing.
DELETE FROM "role_permissions" WHERE "permission_id" IN
  (SELECT "id" FROM "permissions" WHERE "module" = 'events');
DELETE FROM "permissions" WHERE "module" = 'events';
