import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const ATTENDANCE_WITH_DETAILS_INCLUDE = {
  schedule: {
    include: {
      teachingAssignment: {
        include: {
          subject: true,
          classroom: true,
        },
      },
    },
  },
  enrollment: {
    include: {
      student: {
        include: {
          user: {
            include: {
              profile: PROFILE_NAME_SELECT,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.AttendanceInclude;

export type AttendanceWithDetails = Prisma.AttendanceGetPayload<{
  include: typeof ATTENDANCE_WITH_DETAILS_INCLUDE;
}>;
