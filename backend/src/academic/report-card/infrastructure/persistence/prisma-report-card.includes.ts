import { Prisma } from '@prisma/client';

export const REPORT_CARD_WITH_DETAILS_INCLUDE = {
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
      classroom: true,
      semester: { include: { academicYear: true, type: true } },
    },
  },
} satisfies Prisma.ReportCardInclude;

export type ReportCardWithDetails = Prisma.ReportCardGetPayload<{
  include: typeof REPORT_CARD_WITH_DETAILS_INCLUDE;
}>;
