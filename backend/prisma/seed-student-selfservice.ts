import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, AttendanceStatus, AssessmentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

/**
 * Two students, so the boundary can be tested.
 *
 * One student proves nothing. The question this fixture exists to answer is
 * whether student A can reach student B — through the menu, through a
 * bookmarked address, or by naming B's identifier in a query — and that needs a
 * B whose data is unmistakably not A's.
 *
 * It also creates the STUDENT role with the five self-service permissions,
 * because neither database has one: the exposure this feature closed was
 * latent for exactly that reason, and it becomes real the moment such a role
 * exists. Creating it here is how the closure gets proven rather than asserted.
 *
 * Idempotent. Run it twice and the second run changes nothing.
 *
 * Dev only, and the guard below enforces it rather than trusting the operator:
 * these are invented people with invented marks, and a school's production
 * database is not a place to put them.
 */

// Prisma 7 refuses a bare `new PrismaClient()`; the adapter is how every other
// seed in this repository connects, and `DIRECT_URL` is the unpooled string —
// a seed writes, so it should not go through a pooler.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  }),
});

const SELF_SERVICE_CODES = [
  'students.read-own',
  'attendances.read-own',
  'report-cards.read-own',
  'student-scores.read-own',
  'schedules.read-own',
];

const STUDENTS = [
  {
    identifier: 'siswa.a',
    name: 'Aisyah Nurhaliza',
    nis: '2450101',
    nisn: '0091234501',
    nik: '3573060612100001',
    average: 84.5,
    rank: 3,
    note: 'Rajin dan aktif bertanya di kelas.',
    published: true,
    score: 88,
    attendance: [
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.LATE,
    ],
  },
  {
    identifier: 'siswa.b',
    name: 'Bayu Ramadhan',
    nis: '2450102',
    nisn: '0091234502',
    nik: '3573060612100002',
    average: 79.25,
    rank: 8,
    note: 'Perlu meningkatkan ketepatan waktu.',
    published: true,
    score: 72,
    attendance: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT],
  },
];

async function main() {
  // Both strings, because the client connects through DIRECT_URL: guarding
  // only DATABASE_URL would check a string the write never travels on.
  const url = `${process.env.DATABASE_URL ?? ''} ${process.env.DIRECT_URL ?? ''}`;
  if (/apps241_prod|_prod\?|_prod\b/.test(url)) {
    throw new Error(
      'This seed invents students and marks. It refuses to run against a production database.',
    );
  }

  console.log('\n=== Student self-service fixture (dev) ===\n');

  // 1. The role, with self-service grants only.
  //
  // Marked isSystem because the code resolves 'STUDENT' by name when creating
  // students and when enrolling an accepted applicant — the same reason the
  // seed and a migration protect it elsewhere.
  const role = await prisma.role.upsert({
    where: { code: 'STUDENT' },
    update: { isSystem: true },
    create: {
      code: 'STUDENT',
      name: 'Student',
      description: 'Institution Student',
      isSystem: true,
    },
  });

  const permissions = await prisma.permission.findMany({
    where: { code: { in: SELF_SERVICE_CODES } },
  });

  const missing = SELF_SERVICE_CODES.filter(
    (code) => !permissions.some((p) => p.code === code),
  );
  if (missing.length > 0) {
    throw new Error(
      `Permissions absent from the database: ${missing.join(', ')}. ` +
        'They sync on application bootstrap — start the backend once, then re-run.',
    );
  }

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: permission.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }
  console.log(`  role STUDENT + ${permissions.length} self-service grants`);

  // 2. Where they will be enrolled. Reuses what the box already has rather
  //    than inventing a classroom nobody teaches in.
  const semester = await prisma.semester.findFirst({
    where: { isActive: true },
  });
  const classroom = await prisma.classroom.findFirst({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
  });
  if (!semester || !classroom) {
    throw new Error(
      'No active semester or classroom on this box; nothing to enrol into.',
    );
  }
  console.log(`  enrolling into ${classroom.code}, semester ${semester.id}`);

  // 3. One assessment to carry a mark, hung off a teaching assignment that
  //    already exists.
  const assignment = await prisma.teachingAssignment.findFirst({
    where: { deletedAt: null },
  });
  let assessmentItem = assignment
    ? await prisma.assessmentItem.findFirst({
        where: {
          teachingAssignmentId: assignment.id,
          name: 'Ulangan Harian 1',
        },
      })
    : null;
  if (assignment && !assessmentItem) {
    assessmentItem = await prisma.assessmentItem.create({
      data: {
        teachingAssignmentId: assignment.id,
        name: 'Ulangan Harian 1',
        type: AssessmentType.DAILY,
        weight: 1,
        maxScore: 100,
      },
    });
  }

  for (const spec of STUDENTS) {
    let user = await prisma.user.findFirst({
      where: { identifier: spec.identifier },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          identifier: spec.identifier,
          passwordHash: await bcrypt.hash('siswa123', 10),
          isActive: true,
        },
      });
      await prisma.profile.create({
        data: {
          userId: user.id,
          name: spec.name,
          nik: spec.nik,
          gender: 'MALE',
          birthPlace: 'Malang',
          birthDate: new Date('2010-01-01'),
        },
      });
    }

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        nis: spec.nis,
        nisn: spec.nisn,
        gradeId: classroom.gradeId,
      },
    });

    let enrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId: student.id, semesterId: semester.id },
    });
    if (!enrollment) {
      enrollment = await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          classroomId: classroom.id,
          semesterId: semester.id,
        },
      });
    }

    // A published report card each, so the pair is comparable.
    await prisma.reportCard.upsert({
      where: { enrollmentId: enrollment.id },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        totalAverage: spec.average,
        rank: spec.rank,
        teacherNote: spec.note,
        isPublished: spec.published,
      },
    });

    if (assessmentItem) {
      const existing = await prisma.studentScore.findFirst({
        where: {
          enrollmentId: enrollment.id,
          assessmentItemId: assessmentItem.id,
        },
      });
      if (!existing) {
        await prisma.studentScore.create({
          data: {
            enrollmentId: enrollment.id,
            assessmentItemId: assessmentItem.id,
            score: spec.score,
          },
        });
      }
    }

    for (const [index, status] of spec.attendance.entries()) {
      const date = new Date(Date.UTC(2026, 7, 10 + index));
      const existing = await prisma.attendance.findFirst({
        where: { enrollmentId: enrollment.id, date },
      });
      if (!existing) {
        await prisma.attendance.create({
          data: { enrollmentId: enrollment.id, date, status },
        });
      }
    }

    console.log(
      `  ${spec.identifier} / siswa123 — ${spec.name}, NIS ${spec.nis}, rata-rata ${spec.average}`,
    );
  }

  console.log(
    '\n  Both hold only the five -own permissions. Signing in as one and\n' +
      "  reaching the other's record is the check this fixture exists for.\n",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
