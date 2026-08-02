import { Prisma } from '@prisma/client';

export const ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE = {
  teachingAssignment: {
    include: {
      subject: true,
      classroom: true,
      teacher: {
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
  _count: {
    select: {
      studentScores: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.AssessmentItemInclude;

export type AssessmentItemWithDetails = Prisma.AssessmentItemGetPayload<{
  include: typeof ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE;
}>;

export const STUDENT_SCORE_WITH_DETAILS_INCLUDE = {
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
  assessmentItem: true,
} satisfies Prisma.StudentScoreInclude;

export type StudentScoreWithDetails = Prisma.StudentScoreGetPayload<{
  include: typeof STUDENT_SCORE_WITH_DETAILS_INCLUDE;
}>;

/**
 * Report-card reads resolve each score all the way out to its subject —
 * `STUDENT_SCORE_WITH_DETAILS_INCLUDE` stops at `assessmentItem` scalars, which
 * left `assessmentItem.teachingAssignment` undefined for the PDF export.
 */
export const REPORT_CARD_SCORE_INCLUDE = {
  assessmentItem: {
    include: {
      teachingAssignment: {
        include: { subject: true },
      },
    },
  },
} satisfies Prisma.StudentScoreInclude;

export type ReportCardScoreWithSubject = Prisma.StudentScoreGetPayload<{
  include: typeof REPORT_CARD_SCORE_INCLUDE;
}>;
