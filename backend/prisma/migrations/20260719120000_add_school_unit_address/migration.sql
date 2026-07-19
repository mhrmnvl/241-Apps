-- Link institution / school-unit addresses to their owning SchoolUnit, so the
-- "an address must belong to an owner" invariant (enforced in PrismaService)
-- holds for school-unit addresses too — previously they had no owner column and
-- the guard rejected them.

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN "school_unit_id" UUID;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
