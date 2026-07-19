import { AttendanceStatus, PrismaClient } from '@prisma/client';

export async function seedAttendances(
  prisma: PrismaClient,
  enrollments: { id: string; classroomId: string }[],
) {
  if (enrollments.length === 0) {
    console.log('  [attendance] ⚠ no enrollments, skip');
    return;
  }

  const scheduleByClass = new Map<string, string | null>();
  for (const enrollment of enrollments) {
    if (scheduleByClass.has(enrollment.classroomId)) continue;
    const schedule = await prisma.schedule.findFirst({
      where: {
        teachingAssignment: {
          classroomId: enrollment.classroomId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      select: { id: true },
    });
    scheduleByClass.set(enrollment.classroomId, schedule?.id ?? null);
  }

  const statuses: AttendanceStatus[] = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.LATE,
    AttendanceStatus.EXCUSED,
  ];

  const baseDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  let created = 0;
  for (const enrollment of enrollments) {
    const scheduleId = scheduleByClass.get(enrollment.classroomId) ?? null;
    for (let dayIdx = 0; dayIdx < baseDates.length; dayIdx++) {
      const date = baseDates[dayIdx];
      const status = statuses[dayIdx % statuses.length];
      const exists = await prisma.attendance.findFirst({
        where: { enrollmentId: enrollment.id, date, scheduleId },
      });
      if (!exists) {
        await prisma.attendance.create({
          data: {
            enrollmentId: enrollment.id,
            scheduleId,
            date,
            status,
            note:
              status !== AttendanceStatus.PRESENT ? `Sample: ${status}` : null,
          },
        });
        created++;
      }
    }
  }
  console.log(`  [attendance] ${created} created`);
}
