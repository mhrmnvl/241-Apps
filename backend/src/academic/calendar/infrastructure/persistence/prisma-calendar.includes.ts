import { Prisma } from '@prisma/client';

export const CALENDAR_WITH_DETAILS_INCLUDE = {
  academicYear: true,
  semester: true,
  type: true,
} satisfies Prisma.AcademicCalendarInclude;

export type CalendarWithDetails = Prisma.AcademicCalendarGetPayload<{
  include: typeof CALENDAR_WITH_DETAILS_INCLUDE;
}>;

export const EVENT_WITH_DETAILS_INCLUDE = {
  audiences: { include: { audienceGroup: true } },
  classrooms: { include: { classroom: true } },
} satisfies Prisma.EventInclude;

export type EventWithDetails = Prisma.EventGetPayload<{
  include: typeof EVENT_WITH_DETAILS_INCLUDE;
}>;
