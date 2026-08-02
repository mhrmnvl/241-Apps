import { Prisma } from '@prisma/client';

export const SCHEDULE_WITH_DETAILS_INCLUDE = {
  timeSlot: { include: { type: true } },
  teachingAssignment: {
    include: {
      teacher: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
      subject: true,
      classroom: true,
    },
  },
} satisfies Prisma.ScheduleInclude;

export type ScheduleWithDetails = Prisma.ScheduleGetPayload<{
  include: typeof SCHEDULE_WITH_DETAILS_INCLUDE;
}>;
