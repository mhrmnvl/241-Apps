import { Day, PrismaClient } from '@prisma/client';

interface TimeSlotEntry {
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  typeCode: string;
}

const DEFAULT_SLOTS: TimeSlotEntry[] = [
  {
    name: 'Tahfidz',
    startTime: '06:30',
    endTime: '07:15',
    order: 1,
    typeCode: 'TAHFIDZ',
  },
  {
    name: 'Istirahat Pertama',
    startTime: '07:15',
    endTime: '07:30',
    order: 2,
    typeCode: 'BREAK',
  },
  {
    name: 'Jam Ke-1',
    startTime: '07:30',
    endTime: '08:00',
    order: 3,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-2',
    startTime: '08:00',
    endTime: '08:30',
    order: 4,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-3',
    startTime: '08:30',
    endTime: '09:00',
    order: 5,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-4',
    startTime: '09:00',
    endTime: '09:30',
    order: 6,
    typeCode: 'LESSON',
  },
  {
    name: 'Istirahat Kedua',
    startTime: '09:30',
    endTime: '09:50',
    order: 7,
    typeCode: 'BREAK',
  },
  {
    name: 'Jam Ke-5',
    startTime: '09:50',
    endTime: '10:20',
    order: 8,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-6',
    startTime: '10:20',
    endTime: '10:50',
    order: 9,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-7',
    startTime: '10:50',
    endTime: '11:20',
    order: 10,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-8',
    startTime: '11:20',
    endTime: '11:50',
    order: 11,
    typeCode: 'LESSON',
  },
  {
    name: 'Istirahat Ketiga',
    startTime: '11:50',
    endTime: '12:30',
    order: 12,
    typeCode: 'BREAK',
  },
  {
    name: 'Jam Ke-9',
    startTime: '12:30',
    endTime: '13:00',
    order: 13,
    typeCode: 'LESSON',
  },
  {
    name: 'Jam Ke-10',
    startTime: '13:00',
    endTime: '13:30',
    order: 14,
    typeCode: 'LESSON',
  },
  {
    name: 'Upacara',
    startTime: '07:30',
    endTime: '08:30',
    order: 0,
    typeCode: 'CEREMONY',
  },
];

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

/**
 * The school day: which periods exist and when.
 *
 * `schoolUnitId` is accepted and ignored. `TimeSlotType` and `TimeSlot` used to
 * belong to a school unit and no longer do — the deployment is single-school —
 * but this module still filtered and inserted by it, so every query it made was
 * invalid and the seed threw. The parameter stays so the one caller in
 * `seed.ts` does not have to change.
 */
export async function seedTimeSlots(
  prisma: PrismaClient,
  _schoolUnitId?: string,
) {
  // Seed TimeSlotTypes first.
  //
  // `isLesson` is stated for each, not left to the column default of `true`.
  // Every type came out marked as a lesson, so anything asking for lesson
  // periods — a timetable builder, the demo fixture — was offered the morning
  // break and the flag ceremony as slots to teach Matematika in.
  //
  // `days` says which days of the week the type occupies at all. An empty list
  // means every day, which is right for the breaks and for tahfidz and wrong
  // for the one thing that happens once a week: the flag ceremony was seeded
  // with no days and so appeared as a band across Senin to Sabtu, six weekly
  // ceremonies where the school holds one.
  const types = [
    { code: 'LESSON', name: 'Lesson', isLesson: true, days: [] as Day[] },
    { code: 'BREAK', name: 'Break', isLesson: false, days: [] as Day[] },
    {
      code: 'CEREMONY',
      name: 'Ceremony',
      isLesson: false,
      days: [Day.MONDAY],
    },
    { code: 'TAHFIDZ', name: 'Tahfidz', isLesson: false, days: [] as Day[] },
  ];

  const typeMap = new Map<string, string>();
  for (const t of types) {
    let dbType = await prisma.timeSlotType.findFirst({
      where: { code: t.code, deletedAt: null },
    });
    if (dbType) {
      // Corrects a type seeded before `isLesson` and `days` were stated here.
      const sameDays =
        dbType.days.length === t.days.length &&
        t.days.every((d) => dbType!.days.includes(d));
      if (dbType.isLesson !== t.isLesson || !sameDays) {
        dbType = await prisma.timeSlotType.update({
          where: { id: dbType.id },
          data: { isLesson: t.isLesson, days: t.days },
        });
      }
    } else {
      dbType = await prisma.timeSlotType.create({
        data: {
          code: t.code,
          name: t.name,
          isLesson: t.isLesson,
          days: t.days,
        },
      });
    }
    typeMap.set(t.code, dbType.id);
  }

  let created = 0;
  let skipped = 0;

  for (const slot of DEFAULT_SLOTS) {
    const exists = await prisma.timeSlot.findFirst({
      where: { name: slot.name, deletedAt: null },
    });

    if (!exists) {
      const typeId = typeMap.get(slot.typeCode);
      if (!typeId) continue;

      await prisma.timeSlot.create({
        data: {
          name: slot.name,
          startTime: parseTime(slot.startTime),
          endTime: parseTime(slot.endTime),
          order: slot.order,
          typeId,
        },
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(
    `  [time-slot] ${created} created, ${skipped} skipped, ${await prisma.timeSlot.count()} total`,
  );
}
