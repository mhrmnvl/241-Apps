import { Prisma } from '@prisma/client';

export const TIME_SLOT_WITH_TYPE_INCLUDE = {
  type: true,
} satisfies Prisma.TimeSlotInclude;

export type TimeSlotWithType = Prisma.TimeSlotGetPayload<{
  include: typeof TIME_SLOT_WITH_TYPE_INCLUDE;
}>;
