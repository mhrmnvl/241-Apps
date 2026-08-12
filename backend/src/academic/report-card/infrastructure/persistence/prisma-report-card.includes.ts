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
  // The frozen lines, in the order they were generated.
  subjects: { orderBy: { subjectName: 'asc' } },
} satisfies Prisma.ReportCardInclude;

export type ReportCardWithDetails = Prisma.ReportCardGetPayload<{
  include: typeof REPORT_CARD_WITH_DETAILS_INCLUDE;
}>;
