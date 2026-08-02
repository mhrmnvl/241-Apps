import { Prisma } from '@prisma/client';

export const CURRICULUM_WITH_DETAILS_INCLUDE = {
  academicYear: true,
  curriculumSubjects: {
    where: { deletedAt: null },
    include: {
      subject: true,
    },
  },
  _count: {
    select: {
      gradeAcademicYears: true,
    },
  },
} satisfies Prisma.CurriculaInclude;

export type CurriculumWithDetails = Prisma.CurriculaGetPayload<{
  include: typeof CURRICULUM_WITH_DETAILS_INCLUDE;
}>;

export const CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE = {
  curricula: true,
  subject: true,
} satisfies Prisma.CurriculumSubjectInclude;

export type CurriculumSubjectWithDetails = Prisma.CurriculumSubjectGetPayload<{
  include: typeof CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE;
}>;
