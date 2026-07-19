import { ParentRelation, PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedStudentParents(
  prisma: PrismaClient,
  students: { id: string }[],
  parents: { id: string }[],
) {
  const count = parseInt(e('SEED_SP_COUNT', '0'), 10);
  let created = 0;

  if (count === 0 && students[0] && parents[0]) {
    const exists = await prisma.studentParent.findFirst({
      where: { studentId: students[0].id, parentId: parents[0].id },
    });
    if (!exists) {
      await prisma.studentParent.create({
        data: {
          studentId: students[0].id,
          parentId: parents[0].id,
          relation: ParentRelation.FATHER,
          isPrimary: true,
        },
      });
      created++;
    }
    if (students[0] && parents[1]) {
      const exists2 = await prisma.studentParent.findFirst({
        where: { studentId: students[0].id, parentId: parents[1].id },
      });
      if (!exists2) {
        await prisma.studentParent.create({
          data: {
            studentId: students[0].id,
            parentId: parents[1].id,
            relation: ParentRelation.MOTHER,
            isPrimary: false,
          },
        });
        created++;
      }
    }
  } else {
    for (let i = 1; i <= count; i++) {
      const n = String(i);
      const nis = e(`SEED_SP_${n}_STUDENT_NIS`, '');
      const nik = e(`SEED_SP_${n}_PARENT_NIK`, '');
      const relation = e(`SEED_SP_${n}_RELATION`, 'FATHER') as ParentRelation;
      const isPrimary = e(`SEED_SP_${n}_IS_PRIMARY`, 'true') === 'true';

      const student = await prisma.student.findFirst({ where: { nis } });
      const parent = await prisma.parent.findUnique({ where: { nik } });
      if (!student || !parent) {
        console.log(
          `  [student-parent] ⚠ link ${n}: student/parent not found, skip`,
        );
        continue;
      }
      const exists = await prisma.studentParent.findFirst({
        where: { studentId: student.id, parentId: parent.id },
      });
      if (!exists) {
        await prisma.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            relation,
            isPrimary,
          },
        });
        created++;
      }
    }
  }
  console.log(`  [student-parent] ${created} links created`);
}
