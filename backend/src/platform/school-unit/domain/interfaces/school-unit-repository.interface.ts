import { Prisma } from '@prisma/client';

export const SCHOOL_UNIT_INCLUDE = {
  socialMedias: { include: { socialMedia: true } },
  type: true,
} satisfies Prisma.SchoolUnitInclude;

export type SchoolUnitWithDetails = Prisma.SchoolUnitGetPayload<{
  include: typeof SCHOOL_UNIT_INCLUDE;
}>;

export abstract class ISchoolUnitRepository {
  abstract findFirst(): Promise<SchoolUnitWithDetails | null>;
  abstract findById(id: string): Promise<SchoolUnitWithDetails | null>;
  abstract create(
    dto: Prisma.SchoolUnitCreateInput,
  ): Promise<SchoolUnitWithDetails>;
  abstract update(
    id: string,
    dto: Prisma.SchoolUnitUpdateInput,
  ): Promise<SchoolUnitWithDetails>;
}
