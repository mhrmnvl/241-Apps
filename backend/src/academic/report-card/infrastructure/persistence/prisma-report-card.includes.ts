import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const REPORT_CARD_WITH_DETAILS_INCLUDE = {
  enrollment: {
    include: {
      student: {
        include: {
          user: USER_REF_SELECT,
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
