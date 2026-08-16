import { Prisma } from '@prisma/client';

export const CALENDAR_WITH_DETAILS_INCLUDE = {
  academicYear: true,
  semester: true,
  type: true,
  // Which classes the entry is for. An empty array means the whole school —
  // the common case, which is why it is absence rather than a flag.
  classrooms: { include: { classroom: true } },
} satisfies Prisma.AcademicCalendarInclude;

export type CalendarWithDetails = Prisma.AcademicCalendarGetPayload<{
  include: typeof CALENDAR_WITH_DETAILS_INCLUDE;
}>;
