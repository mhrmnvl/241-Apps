import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE = {
  teachingAssignment: {
    include: {
      subject: true,
      classroom: true,
      teacher: {
        include: {
          user: USER_REF_SELECT,
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
          user: USER_REF_SELECT,
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
// Everything the report card needs to grade a score, except the passing mark:
// the item's own maximum and within-type weight, the subject, the teacher's
// per-type weights, and any override they set for this class.
//
// The passing mark is not here on purpose. It belongs to the curriculum, which
// is two joins away (classroom grade + year -> curriculum -> its subjects), and
// reaching it through this include would pull every subject of that curriculum
// once per score row. The generate use case resolves it in one batched lookup
// instead, which is why the classroom's grade and year are selected here.
export const REPORT_CARD_SCORE_INCLUDE = {
  assessmentItem: {
    include: {
      teachingAssignment: {
        include: {
          subject: true,
          assessmentWeights: true,
          classroom: { select: { gradeId: true, academicYearId: true } },
        },
      },
    },
  },
} satisfies Prisma.StudentScoreInclude;

export type ReportCardScoreWithSubject = Prisma.StudentScoreGetPayload<{
  include: typeof REPORT_CARD_SCORE_INCLUDE;
}>;
