import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedEvents(
  prisma: PrismaClient,
  classrooms: { id: string; code: string }[],
  schoolUnitId?: string,
) {
  if (!schoolUnitId) {
    const schoolUnit = await prisma.schoolUnit.findFirst({
      where: { deletedAt: null },
    });
    if (!schoolUnit) {
      throw new Error('No school unit found for seeding events');
    }
    schoolUnitId = schoolUnit.id;
  }

  // Seed Audience Groups first
  const groups = [
    { code: 'TEACHER', name: 'Teacher' },
    { code: 'STUDENT', name: 'Student' },
    { code: 'PARENT', name: 'Parent' },
    { code: 'FINANCE', name: 'Finance' },
    { code: 'ALL', name: 'All' },
  ];

  const groupMap = new Map<string, string>();
  for (const g of groups) {
    let dbGroup = await prisma.audienceGroup.findFirst({
      where: { schoolUnitId, code: g.code },
    });
    dbGroup ??= await prisma.audienceGroup.create({
      data: {
        schoolUnitId,
        code: g.code,
        name: g.name,
      },
    });
    groupMap.set(g.code, dbGroup.id);
  }

  const count = parseInt(e('SEED_EVENT_COUNT', '0'), 10);
  const defaultClass = classrooms[0];
  const days = (n: number) => new Date(Date.now() + n * 86_400_000);

  const items =
    count === 0
      ? [
          {
            className: 'VII-A',
            title: 'Pertemuan Perdana',
            desc: 'Pengenalan mata pelajaran semester ini',
            startOffset: 0,
            endOffset: 0,
            endHAdd: 2,
          },
        ]
      : Array.from({ length: count }, (_, i) => {
          const n = String(i + 1);
          return {
            className: e(
              `SEED_EVENT_${n}_CLASS`,
              classrooms[0]?.code ?? 'VII-A',
            ),
            title: e(`SEED_EVENT_${n}_TITLE`, `Event ${n}`),
            desc: e(`SEED_EVENT_${n}_DESC`, ''),
            startOffset: parseInt(e(`SEED_EVENT_${n}_START_OFFSET`, '0'), 10),
            endOffset: parseInt(e(`SEED_EVENT_${n}_END_OFFSET`, '0'), 10),
            endHAdd: 2,
          };
        });

  let created = 0;
  for (const item of items) {
    const cls =
      classrooms.find((c) => c.code === item.className) ?? defaultClass;
    if (!cls) continue;
    const exists = await prisma.event.findFirst({
      where: {
        schoolUnitId,
        title: item.title,
        classrooms: { some: { classroomId: cls.id } },
      },
    });
    if (!exists) {
      const start = days(item.startOffset);
      const end = new Date(start.getTime() + item.endHAdd * 3_600_000);
      const allAudienceId = groupMap.get('ALL');

      await prisma.event.create({
        data: {
          schoolUnitId,
          title: item.title,
          description: item.desc,
          startTime: start,
          endTime: end,
          classrooms: { create: [{ classroomId: cls.id }] },
          audiences: allAudienceId
            ? { create: [{ audienceGroupId: allAudienceId }] }
            : undefined,
        },
      });
      created++;
    }
  }
  console.log(
    `  [event] ${created} created, ${await prisma.event.count()} total`,
  );
}

export async function seedAnnouncements(
  prisma: PrismaClient,
  classrooms: { id: string; code: string }[],
) {
  const count = parseInt(e('SEED_ANNOUNCEMENT_COUNT', '0'), 10);
  const defaultClass = classrooms[0];
  const days = (n: number) => new Date(Date.now() + n * 86_400_000);

  const items =
    count === 0
      ? [
          {
            className: 'VII-A',
            title: 'Selamat Datang',
            desc: 'Selamat datang di tahun ajaran baru',
            offset: 0,
          },
        ]
      : Array.from({ length: count }, (_, i) => {
          const n = String(i + 1);
          return {
            className: e(`SEED_ANN_${n}_CLASS`, classrooms[0]?.code ?? 'VII-A'),
            title: e(`SEED_ANN_${n}_TITLE`, `Pengumuman ${n}`),
            desc: e(`SEED_ANN_${n}_DESC`, ''),
            offset: parseInt(e(`SEED_ANN_${n}_OFFSET`, '0'), 10),
          };
        });

  let created = 0;
  for (const item of items) {
    const cls =
      classrooms.find((c) => c.code === item.className) ?? defaultClass;
    if (!cls) continue;
    const exists = await prisma.announcement.findFirst({
      where: {
        title: item.title,
        classrooms: { some: { classroomId: cls.id } },
      },
    });
    if (!exists) {
      await prisma.announcement.create({
        data: {
          title: item.title,
          description: item.desc,
          date: days(item.offset),
          classrooms: { create: [{ classroomId: cls.id }] },
        },
      });
      created++;
    }
  }
  console.log(
    `  [announcement] ${created} created, ${await prisma.announcement.count()} total`,
  );
}
