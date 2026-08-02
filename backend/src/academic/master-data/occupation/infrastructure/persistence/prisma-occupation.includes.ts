import { Prisma } from '@prisma/client';

export const OCCUPATION_INCLUDE = {
  _count: {
    select: {
      parents: {
        where: { deletedAt: null },
      },
    },
  },
} satisfies Prisma.OccupationInclude;

export const OCCUPATION_WITH_COUNT_INCLUDE = OCCUPATION_INCLUDE;

export type OccupationWithCount = Prisma.OccupationGetPayload<{
  include: typeof OCCUPATION_INCLUDE;
}>;
