import { PrismaClient } from '@prisma/client';

/**
 * The school-wide default working pattern.
 *
 * Every employee without an explicit assignment is judged against this, and
 * User Story 1 ships with only this one — per-employee patterns arrive in
 * User Story 4. Friday ends early for Jumat prayers; Sunday is not a working
 * day. Saturday is, which is the norm for an Indonesian madrasah and the kind
 * of assumption worth stating rather than inheriting from a Western default.
 */
const DEFAULT_PATTERN_NAME = 'Standar';
const DEFAULT_GRACE_MINUTES = 10;

/** 0 = Sunday … 6 = Saturday, matching JavaScript's `Date#getDay`. */
const DEFAULT_DAYS = [
  { weekday: 0, isWorkingDay: false, startTime: '07:00', endTime: '14:00' },
  { weekday: 1, isWorkingDay: true, startTime: '07:00', endTime: '14:00' },
  { weekday: 2, isWorkingDay: true, startTime: '07:00', endTime: '14:00' },
  { weekday: 3, isWorkingDay: true, startTime: '07:00', endTime: '14:00' },
  { weekday: 4, isWorkingDay: true, startTime: '07:00', endTime: '14:00' },
  { weekday: 5, isWorkingDay: true, startTime: '07:00', endTime: '11:30' },
  { weekday: 6, isWorkingDay: true, startTime: '07:00', endTime: '14:00' },
];

export async function seedWorkPatterns(prisma: PrismaClient) {
  const existing = await prisma.workPattern.findFirst({
    where: { isDefault: true, deletedAt: null },
  });

  if (existing) {
    console.log('  [work-pattern] default pattern already present, skipped');
    return;
  }

  const pattern = await prisma.workPattern.create({
    data: {
      name: DEFAULT_PATTERN_NAME,
      isDefault: true,
      graceMinutes: DEFAULT_GRACE_MINUTES,
      days: { create: DEFAULT_DAYS },
    },
  });

  console.log(
    `  [work-pattern] created "${pattern.name}" with ${DEFAULT_DAYS.length} days`,
  );
}
