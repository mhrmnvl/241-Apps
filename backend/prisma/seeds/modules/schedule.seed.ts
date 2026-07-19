import { Day, PrismaClient } from '@prisma/client';

export async function seedSchedules(
  prisma: PrismaClient,
  teachingAssignments: { id: string; classroomId: string }[],
) {
  if (teachingAssignments.length === 0) {
    console.log('  [schedule] ⚠ no teaching assignments, skip');
    return;
  }

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      type: { code: 'LESSON' },
      deletedAt: null,
    },
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  if (timeSlots.length === 0) {
    console.log('  [schedule] ⚠ no lesson time slots, skip');
    return;
  }

  const days: Day[] = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
    Day.SATURDAY,
  ];

  const byClass = new Map<string, { id: string }[]>();
  for (const ta of teachingAssignments) {
    const list = byClass.get(ta.classroomId) ?? [];
    list.push({ id: ta.id });
    byClass.set(ta.classroomId, list);
  }

  let created = 0;
  for (const [, classAssignments] of byClass) {
    let dayIdx = 0;
    let slotIdx = 0;

    for (const ta of classAssignments) {
      const day = days[dayIdx % days.length];
      const timeSlot = timeSlots[slotIdx % timeSlots.length];

      const exists = await prisma.schedule.findFirst({
        where: {
          teachingAssignmentId: ta.id,
          day,
          timeSlotId: timeSlot.id,
          deletedAt: null,
        },
      });

      if (!exists) {
        await prisma.schedule.create({
          data: {
            teachingAssignmentId: ta.id,
            timeSlotId: timeSlot.id,
            day,
            room: null,
          },
        });
        created++;
      }

      slotIdx++;
      if (slotIdx % timeSlots.length === 0) {
        dayIdx++;
      }
    }
  }

  console.log(`  [schedule] ${created} created`);
}
