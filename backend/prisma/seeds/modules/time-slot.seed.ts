import { PrismaClient } from '@prisma/client';

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

export async function seedTimeSlots(
  prisma: PrismaClient,
  schoolUnitId?: string,
) {
  if (!schoolUnitId) {
    const schoolUnit = await prisma.schoolUnit.findFirst({
      where: { deletedAt: null },
    });
    if (!schoolUnit) {
      throw new Error('No school unit found for seeding time slots');
    }
    schoolUnitId = schoolUnit.id;
  }

  // Seed TimeSlotTypes first
  const types = [
    { code: 'LESSON', name: 'Lesson' },
    { code: 'BREAK', name: 'Break' },
    { code: 'CEREMONY', name: 'Ceremony' },
    { code: 'TAHFIDZ', name: 'Tahfidz' },
  ];

  const typeMap = new Map<string, string>();
  for (const t of types) {
    let dbType = await prisma.timeSlotType.findFirst({
      where: { schoolUnitId, code: t.code },
    });
    dbType ??= await prisma.timeSlotType.create({
      data: {
        schoolUnitId,
        code: t.code,
        name: t.name,
      },
    });
    typeMap.set(t.code, dbType.id);
  }

  let created = 0;
  let skipped = 0;

  for (const slot of DEFAULT_SLOTS) {
    const exists = await prisma.timeSlot.findFirst({
      where: { schoolUnitId, name: slot.name },
    });

    if (!exists) {
      const typeId = typeMap.get(slot.typeCode);
      if (!typeId) continue;

      await prisma.timeSlot.create({
        data: {
          schoolUnitId,
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
