import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const SCHEDULE_WITH_DETAILS_INCLUDE = {
  timeSlot: { include: { type: true } },
  teachingAssignment: {
    include: {
      teacher: {
        include: {
          user: {
            include: {
              profile: PROFILE_NAME_SELECT,
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
