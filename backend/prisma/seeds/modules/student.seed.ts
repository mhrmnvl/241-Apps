import { PrismaClient, StudentStatus, UserGender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const e = (key: string, fallback: string) => {
  const val = process.env[key];
  return val && val.trim() !== '' ? val : fallback;
};

export async function seedStudents(
  prisma: PrismaClient,
  classrooms: { id: string; code: string; gradeId: string }[],
  schoolUnitId: string,
) {
  const count = parseInt(e('SEED_STUDENT_COUNT', '1'), 10);
  const students: { id: string }[] = [];

  const studentRole = await prisma.role.findFirst({
    where: { code: 'STUDENT' },
  });

  for (let i = 1; i <= count; i++) {
    const n = String(i);
    const username = e(
      `SEED_STUDENT_${n}_USERNAME`,
      i === 1 ? e('SEED_STUDENT_USERNAME', 'siswa') : `siswa0${n}`,
    );
    const password = e(
      `SEED_STUDENT_${n}_PASSWORD`,
      e('SEED_STUDENT_PASSWORD', 'password123'),
    );
    const name = e(
      `SEED_STUDENT_${n}_NAME`,
      i === 1 ? e('SEED_STUDENT_NAME', 'Ahmad Dahlan') : `Siswa ${n}`,
    );
    const nik = e(`SEED_STUDENT_${n}_NIK`, `35730606${String(100000 + i)}`);
    const nis = e(
      `SEED_STUDENT_${n}_NIS`,
      i === 1 ? e('SEED_STUDENT_NIS', '245001') : `24500${n}`,
    );
    const nisn = e(
      `SEED_STUDENT_${n}_NISN`,
      `001234${String(i).padStart(4, '0')}`,
    );
    const gender = e(`SEED_STUDENT_${n}_GENDER`, 'MALE') as UserGender;
    const birthPlace = e(`SEED_STUDENT_${n}_BIRTH_PLACE`, 'Malang');
    const birthDate = new Date(e(`SEED_STUDENT_${n}_BIRTH_DATE`, '2010-01-01'));
    const classCode = e(`SEED_STUDENT_${n}_CLASS`, 'VII-A');

    const targetClass = classrooms.find((c) => c.code === classCode);
    if (!targetClass) {
      console.log(
        `  [student] ⚠ class "${classCode}" not found, skip ${username}`,
      );
      continue;
    }

    let user = await prisma.user.findFirst({
      where: { identifier: username },
    });
    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          identifier: username,
          passwordHash: hashed,
          isActive: true,
        },
      });

      if (studentRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: studentRole.id,
          },
        });
      }

      const nikExists = await prisma.profile.findFirst({ where: { nik } });
      if (!nikExists) {
        await prisma.profile.create({
          data: { userId: user.id, name, nik, gender, birthPlace, birthDate },
        });
      }
    }

    let student = await prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) {
      const nisExists = await prisma.student.findFirst({ where: { nis } });
      if (!nisExists) {
        student = await prisma.student.create({
          data: {
            userId: user.id,
            nis,
            nisn,
            status: StudentStatus.ACTIVE,
            gradeId: targetClass.gradeId,
          },
        });

        await prisma.address.create({
          data: {
            studentId: student.id,
            street: e(`SEED_STUDENT_${n}_STREET`, `Jl. Pelangi No. ${n}`),
            rt: '001',
            rw: '001',
            village: e(`SEED_STUDENT_${n}_VILLAGE`, 'Bareng'),
            district: e(`SEED_STUDENT_${n}_DISTRICT`, 'Klojen'),
            city: e(`SEED_STUDENT_${n}_CITY`, 'Kota Malang'),
            province: e(`SEED_STUDENT_${n}_PROVINCE`, 'Jawa Timur'),
            postalCode: e(`SEED_STUDENT_${n}_POSTAL`, '65116'),
            isPrimary: true,
          },
        });
      }
    }

    if (student) {
      students.push({ id: student.id });
    }
    console.log(`  [student] ${username} (${name}) → ${classCode}`);
  }
  return students;
}
