import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedClasses(
  prisma: PrismaClient,
  curriculumId?: string,
  academicYearId?: string,
) {
  // Seed classroom levels first (7=VII, 8=VIII, 9=IX)
  const levelMap = new Map<string, string>(); // levelName -> id
  const defaultLevels = [
    { level: 7, name: 'VII' },
    { level: 8, name: 'VIII' },
    { level: 9, name: 'IX' },
  ];

  for (const lv of defaultLevels) {
    const existing = await prisma.grade.findFirst({
      where: { level: lv.level },
    });
    const level =
      existing ??
      (await prisma.grade.create({
        data: { level: lv.level, name: lv.name },
      }));
    levelMap.set(lv.name, level.id);
  }

  // Parse classroom config: "VIII-A:VIII,VIII-B:VIII,IX-A:IX"
  const raw = e('SEED_classrooms', 'VII-A:VII,VII-B:VII,VIII-A:VIII,IX-A:IX');
  const entries = raw
    .split(',')
    .map((item) => {
      const [code, lvlName] = item.trim().split(':');
      return { code: code.trim(), levelName: lvlName?.trim() };
    })
    .filter(
      (c): c is { code: string; levelName: string } =>
        !!c.code && !!c.levelName && levelMap.has(c.levelName),
    );

  const classrooms: { id: string; code: string; gradeId: string }[] = [];
  let created = 0;

  for (let i = 0; i < entries.length; i++) {
    const { code, levelName } = entries[i];
    const gradeId = levelMap.get(levelName);

    if (!gradeId || !curriculumId || !academicYearId) {
      console.log(`  [class] ⚠ missing curriculum/year context, skip ${code}`);
      continue;
    }

    let cls = await prisma.classroom.findFirst({
      where: {
        curriculumId,
        academicYearId,
        gradeId,
        code,
        deletedAt: null,
      },
    });
    if (!cls) {
      cls = await prisma.classroom.create({
        data: {
          curriculumId,
          academicYearId,
          gradeId,
          code,
          name: code,
          capacity: parseInt(
            e(`SEED_CLASS_${i + 1}_CAPACITY`, e('SEED_CLASS_CAPACITY', '32')),
            10,
          ),
        },
      });
      created++;
    }
    classrooms.push({ id: cls.id, code: cls.code, gradeId });
  }
  console.log(`  [class] ${created} created, ${classrooms.length} total`);
  return classrooms;
}
