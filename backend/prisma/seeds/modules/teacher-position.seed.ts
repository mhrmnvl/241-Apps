import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => {
  const val = process.env[key];
  return val && val.trim() !== '' ? val : fallback;
};

export async function seedTeacherPositions(
  prisma: PrismaClient,
  teachers: { id: string }[],
) {
  let created = 0;
  for (let i = 0; i < teachers.length; i++) {
    const n = String(i + 1);
    const posName = e(
      `SEED_TEACHER_${n}_POSITION`,
      i === 0 ? 'Wali Kelas' : 'Guru',
    );
    const hireDate = new Date(e(`SEED_TEACHER_${n}_HIRE_DATE`, '2020-07-01'));
    const isPrimary = e(`SEED_TEACHER_${n}_IS_PRIMARY`, 'true') === 'true';

    const position = await prisma.position.findFirst({
      where: { name: posName, isActive: true },
    });
    if (!position) {
      console.log(
        `  [teacher-position] ⚠ position "${posName}" not found, skip teacher ${n}`,
      );
      continue;
    }

    const exists = await prisma.teacherPosition.findFirst({
      where: { teacherId: teachers[i].id, positionId: position.id },
    });
    if (!exists) {
      await prisma.teacherPosition.create({
        data: {
          teacherId: teachers[i].id,
          positionId: position.id,
          hireDate,
          isPrimary,
        },
      });
      created++;
    }
  }
  console.log(`  [teacher-position] ${created} created`);
}
