import { Prisma } from '@prisma/client';

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
              profile: true,
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
