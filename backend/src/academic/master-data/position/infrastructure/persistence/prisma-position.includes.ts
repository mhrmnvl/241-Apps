import { Prisma } from '@prisma/client';

export const POSITION_INCLUDE = {
  category: true,
} satisfies Prisma.PositionInclude;

export const POSITION_WITH_CATEGORY_INCLUDE = POSITION_INCLUDE;

export type PositionWithCategory = Prisma.PositionGetPayload<{
  include: typeof POSITION_INCLUDE;
}>;
