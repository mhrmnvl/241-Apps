import { PrismaPg } from '@prisma/adapter-pg';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';
import {
  AssessmentType,
  AttendanceStatus,
  IncomeRange,
  ParentRelation,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  seedAnnouncements,
  seedNonWorkingDays,
} from './seeds/modules/school-life.seed.js';
import { seedTeachingPlan } from './seeds/modules/teaching-plan.seed.js';
import {
  seedTimetable,
  type TimetablePeriod,
} from './seeds/modules/timetable.seed.js';

/**
 * Every period of the school day, as the timetable builder needs it.
 *
 * All of them, not only the teaching ones: the ceremony and the breaks are
 * what say which teaching periods are already spoken for. `@db.Time(0)` comes
 * back as a Date on 1970-01-01, so the clock is read off it in UTC.
 */
async function readPeriods(prisma: PrismaClient): Promise<TimetablePeriod[]> {
  const slots = await prisma.timeSlot.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      type: { select: { isLesson: true, days: true } },
    },
    orderBy: { order: 'asc' },
  });

  const minutes = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();
  return slots.map((slot) => ({
    id: slot.id,
    startMinutes: minutes(slot.startTime),
    endMinutes: minutes(slot.endTime),
    isLesson: slot.type.isLesson,
    days: slot.type.days,
  }));
}
import {
  calculateSubjectGrades,
  calculateTotalAverage,
  type ScoredAssessment,
  type SubjectGradeInput,
} from '../src/academic/report-card/services/calculate-subject-grades.js';
import { DEFAULT_PASSING_SCORE } from '../src/academic/report-card/constants/report-card.constants.js';

/**
 * A school year with something in it, across all three grades.
 *
 * The academic features were correct and the screens were empty: two students,
 * one assessment item, no schedules at all. A demo of a correct system that
 * shows nothing is indistinguishable from a demo of a broken one, and the
 * screens that looked emptiest — the student's own schedule, marks and rapor —
 * are the ones built most recently.
 *
 * What it makes, for each of the six classrooms the box already has:
 *
 *   - six students, enrolled in the active semester;
 *   - six subjects taught by real teachers from the staff list;
 *   - a weekly timetable, so a schedule screen has a week to show;
 *   - four assessments per subject, weighted the way a term actually is;
 *   - a mark for every student in every assessment;
 *   - four weeks of attendance, mostly present, with enough sick and absent
 *     days that the rapor's attendance box is not three zeroes;
 *   - a published report card, ranked within its class.
 *
 * The marks on the report cards are computed by `calculateSubjectGrades` and
 * `calculateTotalAverage` — the same functions `GenerateReportCardUseCase`
 * calls, imported directly. That matters: the two students that already existed
 * had a rapor carrying an average, a rank, and no subject lines at all, because
 * nothing had ever run the real calculation for them, and a fixture that
 * invents its own figures proves only that figures can be inserted.
 *
 * Calling the use case itself would be better still and was tried first. It
 * cannot run here: Nest resolves constructor dependencies from
 * `emitDecoratorMetadata`, which esbuild — under `tsx` — does not emit, and
 * `ts-node`'s ESM loader hits a module cycle on Node 24. So the arithmetic is
 * the real one and the queries around it are this file's; the passing-score
 * order below mirrors the use case deliberately, and is the one part worth
 * re-checking if the two ever disagree.
 *
 * Idempotent: identifiers, codes and dates are all derived, so a second run
 * updates rather than duplicates.
 *
 * Dev only, and the guard enforces it. These are invented children with
 * invented marks.
 */

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

/** Enough names that no class is a list of near-identical strings. */
const GIVEN_NAMES = [
  'Aditya Pratama',
  'Bunga Lestari',
  'Cahya Ramadhan',
  'Dinda Maharani',
  'Elang Saputra',
  'Fitri Handayani',
  'Gilang Nugroho',
  'Hana Safitri',
  'Irfan Maulana',
  'Julia Anggraini',
  'Kevin Hidayat',
  'Laila Rahmawati',
  'Miftah Fauzan',
  'Nadia Puspita',
  'Oki Firmansyah',
  'Putri Ayu Wulandari',
  'Qori Ananda',
  'Rizky Kurniawan',
  'Salma Aulia',
  'Taufik Hidayatullah',
  'Umi Kalsum',
  'Vino Ardiansyah',
  'Wulan Sari',
  'Yusuf Abdillah',
  'Zahra Amelia',
  'Andini Kusuma',
  'Bagas Setiawan',
  'Citra Dewi',
  'Dimas Prakoso',
  'Elsa Novita',
  'Farhan Alfarizi',
  'Gina Melati',
  'Hafiz Ramadhan',
  'Indah Permatasari',
  'Joko Susilo',
  'Kirana Ayu',
];

const STUDENTS_PER_CLASS = 6;
const SUBJECTS_PER_CLASS = 6;

/**
 * A term's assessments, weighted the way a report card is actually computed:
 * the daily marks together matter about as much as the two exams.
 */
const ASSESSMENTS: {
  name: string;
  type: AssessmentType;
  weight: number;
}[] = [
  { name: 'Ulangan Harian 1', type: AssessmentType.DAILY, weight: 1 },
  { name: 'Ulangan Harian 2', type: AssessmentType.DAILY, weight: 1 },
  {
    name: 'Penilaian Tengah Semester',
    type: AssessmentType.MIDTERM,
    weight: 1,
  },
  { name: 'Penilaian Akhir Semester', type: AssessmentType.FINAL, weight: 1 },
];

const TYPE_WEIGHTS: { type: AssessmentType; weight: number }[] = [
  { type: AssessmentType.DAILY, weight: 0.4 },
  { type: AssessmentType.MIDTERM, weight: 0.25 },
  { type: AssessmentType.FINAL, weight: 0.35 },
];

/**
 * Deterministic pseudo-randomness.
 *
 * `Math.random()` would give a different school every run, so a screenshot
 * taken today would not match the database tomorrow — and a mark that moved on
 * its own is exactly the kind of thing a demo cannot explain.
 */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** A believable mark: mostly 70–95, occasionally below the pass mark. */
function markFor(index: number): number {
  const base = 62 + Math.floor(seeded(index) * 36);
  return Math.min(98, base);
}

function attendanceFor(index: number): AttendanceStatus {
  const r = seeded(index * 7.13);
  if (r < 0.86) return AttendanceStatus.PRESENT;
  if (r < 0.91) return AttendanceStatus.SICK;
  if (r < 0.95) return AttendanceStatus.EXCUSED;
  if (r < 0.98) return AttendanceStatus.LATE;
  return AttendanceStatus.ABSENT;
}

/** The last four weeks of school days, Monday to Saturday. */
function schoolDays(count: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (days.length < count) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (cursor.getUTCDay() !== 0) days.push(new Date(cursor));
  }
  return days.reverse();
}

/**
 * Rows written against the wrong academic year, taken back out.
 *
 * An earlier version of this fixture taught and enrolled next year's
 * classrooms in this year's semester. Those rows are not merely untidy: a
 * teaching assignment whose classroom sits in one year and whose semester sits
 * in another is a combination the API will not create, so nothing downstream
 * is written to expect it.
 *
 * Compared row by row rather than by ruling out a whole year, so that a school
 * which has legitimately opened next year's term keeps its teaching. The only
 * rows that match are ones no API call could have produced.
 *
 * Deleted rather than soft-deleted, and in dependency order: `student_scores`
 * and `attendances` hold their enrolment by a plain foreign key, so the
 * database refuses to remove the enrolment underneath them.
 */
async function repairYearMismatch(prisma: PrismaClient) {
  const yearOf = {
    classroom: { select: { academicYearId: true } },
    semester: { select: { academicYearId: true } },
  };

  const straddlesTwoYears = (row: {
    classroom: { academicYearId: string };
    semester: { academicYearId: string };
  }) => row.classroom.academicYearId !== row.semester.academicYearId;

  const assignments = await prisma.teachingAssignment.findMany({
    select: { id: true, ...yearOf },
  });
  const enrolments = await prisma.studentEnrollment.findMany({
    select: { id: true, ...yearOf },
  });

  const assignmentIds = assignments.filter(straddlesTwoYears).map((a) => a.id);
  const enrolmentIds = enrolments.filter(straddlesTwoYears).map((e) => e.id);
  if (assignmentIds.length === 0 && enrolmentIds.length === 0) return;

  const items = await prisma.assessmentItem.findMany({
    where: { teachingAssignmentId: { in: assignmentIds } },
    select: { id: true },
  });
  const itemIds = items.map((i) => i.id);

  const removed = await prisma.$transaction(async (tx) => {
    const scores = await tx.studentScore.deleteMany({
      where: {
        OR: [
          { assessmentItemId: { in: itemIds } },
          { enrollmentId: { in: enrolmentIds } },
        ],
      },
    });
    const attendances = await tx.attendance.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    // ReportCardSubject follows its report card by cascade.
    const reportCards = await tx.reportCard.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    const schedules = await tx.schedule.deleteMany({
      where: { teachingAssignmentId: { in: assignmentIds } },
    });
    // AssessmentWeight follows its assignment by cascade; AssessmentItem is
    // removed here so the count can be reported.
    const assessmentItems = await tx.assessmentItem.deleteMany({
      where: { id: { in: itemIds } },
    });
    await tx.teachingAssignment.deleteMany({
      where: { id: { in: assignmentIds } },
    });
    await tx.studentEnrollment.deleteMany({
      where: { id: { in: enrolmentIds } },
    });

    return {
      scores: scores.count,
      attendances: attendances.count,
      reportCards: reportCards.count,
      schedules: schedules.count,
      assessmentItems: assessmentItems.count,
    };
  });

  console.log('  Cleared rows filed under the wrong academic year:');
  console.log(
    `    ${assignmentIds.length} teaching assignments, ${removed.assessmentItems} tasks, ${removed.scores} marks`,
  );
  console.log(
    `    ${enrolmentIds.length} enrolments, ${removed.attendances} attendances, ${removed.reportCards} report cards`,
  );
  console.log(`    ${removed.schedules} timetable rows`);
}

/**
 * Everything that names one invented child, derived from one number.
 *
 * The account name and the NIK used to be numbered separately — the name from
 * the classroom's position in the list, the NIK from a counter that ran across
 * the whole seeding. Shorten the list, as scoping it to one academic year
 * does, and the two came apart: the run asked for an account name that did not
 * exist yet, went to create it, and was refused because some earlier child was
 * still holding the NIK that counter had reached.
 *
 * One key for all four means an account name always implies the same NIK, so
 * the fixture converges on the same children however the last run left it.
 */
function fixtureStudentKeys(
  classCode: string,
  classIndex: number,
  indexInClass: number,
) {
  const ordinal = classIndex * STUDENTS_PER_CLASS + indexInClass + 1;
  const serial = String(ordinal).padStart(3, '0');
  return {
    identifier: `siswa.${classCode.toLowerCase()}.${serial}`,
    nis: `2460${serial}`,
    nisn: `00912360${serial}`,
    nik: `3573061201${String(199999 + ordinal).padStart(6, '0')}`,
  };
}

/**
 * Children this fixture invented and would not invent again, removed.
 *
 * The account name carries the classroom it was made for —
 * `siswa.viii-a.019` — so shortening the classroom list leaves the children of
 * the classrooms that went away with nowhere to sit, and shifts the numbering
 * of everyone after the first classroom. Both are cleared the same way: this
 * fixture owns every `siswa.*` account, so any it would not create on this run
 * is one it left behind on an earlier one.
 *
 * Nothing here can match a student the school entered: those are named by the
 * school, not `siswa.<class>.<number>`.
 */
async function removeUnownedFixtureStudents(
  prisma: PrismaClient,
  owned: string[],
) {
  const orphans = await prisma.user.findMany({
    where: {
      identifier: { startsWith: 'siswa.', notIn: owned },
    },
    select: { id: true, student: { select: { id: true } } },
  });
  if (orphans.length === 0) return;

  const userIds = orphans.map((u) => u.id);
  const studentIds = orphans.flatMap((u) => (u.student ? [u.student.id] : []));

  const enrolments = await prisma.studentEnrollment.findMany({
    where: { studentId: { in: studentIds } },
    select: { id: true },
  });
  const enrolmentIds = enrolments.map((e) => e.id);

  await prisma.$transaction(async (tx) => {
    // A child this fixture is giving up may still be sitting in a classroom,
    // with marks and attendance against that seat. Those go first: they hold
    // the enrolment by a plain foreign key, and the enrolment holds the child.
    await tx.studentScore.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    await tx.attendance.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    await tx.reportCard.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    await tx.studentEnrollment.deleteMany({
      where: { id: { in: enrolmentIds } },
    });
    await tx.studentParent.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await tx.studentGraduationHold.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await tx.studentGraduation.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await tx.student.deleteMany({ where: { id: { in: studentIds } } });
    // Profile holds its user by a plain foreign key; UserRole and the refresh
    // tokens follow by cascade.
    await tx.profile.deleteMany({ where: { userId: { in: userIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });

  console.log(
    `  Removed ${orphans.length} fixture students this run does not own`,
  );
}

const FATHER_NAMES = [
  'Asep Sutisna',
  'Budi Rahmat',
  'Cecep Hidayat',
  'Dadang Suryana',
  'Endang Permana',
  'Farid Nugraha',
  'Gunawan Setiadi',
  'Hendra Wijaya',
  'Irfan Sopandi',
  'Jajang Kurnia',
  'Komar Solihin',
  'Lukman Hakim',
];

const MOTHER_NAMES = [
  'Ani Suryani',
  'Betty Marlina',
  'Cucu Rohaeti',
  'Dewi Kartika',
  'Euis Nurhayati',
  'Fitria Ningsih',
  'Gina Aprilia',
  'Hesti Wulandari',
  'Ika Rosmiati',
  'Juju Juariah',
  'Kartini Lestari',
  'Lilis Sumiati',
];

/**
 * A guardian each, so that Data Orang Tua and Relasi Orang Tua hold something.
 *
 * Both screens read empty, and the relation between them is the part worth
 * showing: a parent record exists once and is tied to a child, rather than
 * being copied into the child's row. Each invented student gets a father
 * marked primary and a mother beside him.
 *
 * Only students this fixture invented. A child the school entered has a real
 * family, and inventing one for them would put a made-up name on a real
 * record.
 */
async function seedGuardians(prisma: PrismaClient) {
  const students = await prisma.student.findMany({
    where: { deletedAt: null, user: { identifier: { startsWith: 'siswa.' } } },
    select: { id: true },
    orderBy: { nis: 'asc' },
  });
  if (students.length === 0) return;

  const occupations = await prisma.occupation.findMany({
    where: { deletedAt: null },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  const educations = await prisma.education.findMany({
    where: { deletedAt: null },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  if (occupations.length === 0) {
    console.log('  no occupations on this box, skipping guardians');
    return;
  }

  const incomes = Object.values(IncomeRange);
  let created = 0;
  let linked = 0;

  for (const [i, student] of students.entries()) {
    const pair = [
      {
        name: FATHER_NAMES[i % FATHER_NAMES.length],
        relation: ParentRelation.FATHER,
        isPrimary: true,
        nik: `3573060101${String(700000 + i * 2).padStart(6, '0')}`,
      },
      {
        name: MOTHER_NAMES[i % MOTHER_NAMES.length],
        relation: ParentRelation.MOTHER,
        isPrimary: false,
        nik: `3573064102${String(700001 + i * 2).padStart(6, '0')}`,
      },
    ];

    for (const [n, spec] of pair.entries()) {
      // The NIK is the identity here, as it is on the form.
      const existing = await prisma.parent.findFirst({
        where: { nik: spec.nik, deletedAt: null },
        select: { id: true },
      });
      const parent =
        existing ??
        (await prisma.parent.create({
          data: {
            name: spec.name,
            nik: spec.nik,
            birthPlace: 'Bandung',
            birthDate: new Date(
              `198${(i + n) % 10}-0${((i + n) % 9) + 1}-1${(i + n) % 9}`,
            ),
            phone: `08${String(1200000000 + i * 7 + n).slice(0, 10)}`,
            occupationId: occupations[(i + n) % occupations.length].id,
            educationId: educations.length
              ? educations[(i + n) % educations.length].id
              : null,
            income: incomes[(i + n) % incomes.length],
          },
        }));
      if (!existing) created++;

      const link = await prisma.studentParent.findFirst({
        where: { studentId: student.id, parentId: parent.id, deletedAt: null },
        select: { id: true },
      });
      if (!link) {
        await prisma.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            relation: spec.relation,
            isPrimary: spec.isPrimary,
          },
        });
        linked++;
      }
    }
  }

  console.log(`  ${created} guardians recorded, ${linked} tied to a child`);
}

/**
 * Who runs each class: ketua, wakil, sekretaris, bendahara.
 *
 * One row per class per term, which is what the unique key says — so this
 * updates rather than appends, and a class that gains students does not end up
 * with two committees.
 */
async function seedClassroomStructures(
  prisma: PrismaClient,
  semesterId: string,
  classrooms: { id: string; code: string }[],
) {
  let written = 0;

  for (const classroom of classrooms) {
    const enrolled = await prisma.studentEnrollment.findMany({
      where: { deletedAt: null, semesterId, classroomId: classroom.id },
      select: { studentId: true },
      orderBy: { studentId: 'asc' },
      take: 4,
    });
    if (enrolled.length < 4) continue;

    const [president, vice, secretary, treasurer] = enrolled.map(
      (e) => e.studentId,
    );

    const seats = {
      presidentId: president,
      vicePresidentId: vice,
      secretaryId: secretary,
      treasurerId: treasurer,
    };

    await prisma.classroomStructure.upsert({
      where: {
        classroomId_semesterId: { classroomId: classroom.id, semesterId },
      },
      update: seats,
      create: { classroomId: classroom.id, semesterId, ...seats },
    });
    written++;
  }

  console.log(`  ${written} class committees seated`);
}

/**
 * Something on the Prestasi Siswa screen.
 *
 * The table held one row — a single achievement against a single child, which
 * on a list screen is indistinguishable from a feature that does not work.
 *
 * Hung off the profile rather than the student: an achievement belongs to a
 * person, and a teacher can hold one too. These are all students, because that
 * is the screen that was empty.
 */
const ACHIEVEMENTS: { name: string; level: string; yearsAgo: number }[] = [
  {
    name: "Juara 1 Musabaqah Tilawatil Qur'an",
    level: 'Kecamatan',
    yearsAgo: 0,
  },
  { name: 'Juara 2 Olimpiade Matematika', level: 'Kabupaten', yearsAgo: 0 },
  { name: 'Juara 1 Pidato Bahasa Arab', level: 'Kecamatan', yearsAgo: 1 },
  { name: 'Juara 3 Lomba Cerdas Cermat', level: 'Kabupaten', yearsAgo: 0 },
  { name: 'Juara 1 Futsal Antar Madrasah', level: 'Kecamatan', yearsAgo: 1 },
  { name: 'Juara 2 Kaligrafi', level: 'Provinsi', yearsAgo: 0 },
  { name: 'Juara Harapan 1 Tahfidz 5 Juz', level: 'Kabupaten', yearsAgo: 0 },
  { name: 'Juara 3 Lomba Pramuka', level: 'Kecamatan', yearsAgo: 1 },
];

async function seedAchievements(prisma: PrismaClient, openingYear: number) {
  const types = await prisma.achievementType.findMany({
    where: { deletedAt: null },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  if (types.length === 0) {
    console.log('  no achievement types on this box, skipping achievements');
    return;
  }

  // Students this fixture invented, so nothing is credited to a real child who
  // did not win it.
  const students = await prisma.student.findMany({
    where: { deletedAt: null, user: { identifier: { startsWith: 'siswa.' } } },
    select: { user: { select: { profile: { select: { id: true } } } } },
    orderBy: { nis: 'asc' },
  });
  const profileIds = students
    .map((s) => s.user.profile?.id)
    .filter((id): id is string => Boolean(id));
  if (profileIds.length === 0) return;

  let created = 0;
  for (const [i, spec] of ACHIEVEMENTS.entries()) {
    const profileId = profileIds[i % profileIds.length];

    // Keyed by the child and the award, so a re-run does not hand the same
    // student the same trophy twice.
    const existing = await prisma.achievement.findFirst({
      where: { profileId, name: spec.name, deletedAt: null },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.achievement.create({
      data: {
        profileId,
        name: spec.name,
        level: spec.level,
        typeId: types[i % types.length].id,
        year: openingYear - spec.yearsAgo,
        description: `Diraih mewakili madrasah pada tingkat ${spec.level.toLowerCase()}.`,
      },
    });
    created++;
  }

  console.log(`  ${created} student achievements recorded`);
}

async function main() {
  const url = `${process.env.DATABASE_URL ?? ''} ${process.env.DIRECT_URL ?? ''}`;
  if (/apps241_prod|_prod\?|_prod\b/.test(url)) {
    throw new Error(
      'This fixture invents children and marks. It refuses to run against a production database.',
    );
  }

  console.log('\n=== Academic demo fixture (dev) ===\n');

  const semester = await prisma.semester.findFirst({
    where: { isActive: true },
    include: { academicYear: { select: { startYear: true, name: true } } },
  });
  if (!semester) throw new Error('No active semester on this box.');

  // The calendar year the school year opens in — 2026 for "2026/2027". Read
  // rather than parsed out of the name, which the school is free to rename.
  const openingYear = semester.academicYear.startYear;

  // Before writing anything: an earlier run of this fixture filed teaching and
  // enrolments under a classroom from another academic year.
  await repairYearMismatch(prisma);

  /*
   * Only this year's classrooms.
   *
   * Unfiltered, this picked up next year's set as well — the copies the
   * kenaikan-kelas screen makes ahead of a promotion — and taught, timetabled
   * and enrolled them against *this* year's semester. Six classrooms became
   * twelve, every code appeared twice, and half the teaching in the active
   * term pointed at a classroom belonging to a year that has no term yet.
   *
   * The API refuses exactly this: `CreateTeachingAssignmentUseCase` answers
   * with "Classroom and semester must belong to the same academic year". A
   * fixture writing through Prisma walks past that check, which is why it has
   * to keep the rule itself.
   */
  const classrooms = await prisma.classroom.findMany({
    where: { deletedAt: null, academicYearId: semester.academicYearId },
    include: { grade: true },
    orderBy: { code: 'asc' },
  });
  if (classrooms.length === 0) {
    throw new Error('No classrooms in the active academic year on this box.');
  }

  // Whatever an earlier run left behind under a different classroom list.
  await removeUnownedFixtureStudents(
    prisma,
    classrooms.flatMap((classroom, classIndex) =>
      Array.from(
        { length: STUDENTS_PER_CLASS },
        (_, i) => fixtureStudentKeys(classroom.code, classIndex, i).identifier,
      ),
    ),
  );

  const subjects = await prisma.subject.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
  });
  const teachers = await prisma.teacher.findMany({
    where: { deletedAt: null },
    orderBy: { nip: 'asc' },
  });
  // Lesson slots only. The list also holds break and prayer periods, and a
  // timetable that teaches Matematika during Istirahat Pertama is the kind of
  // thing an audience notices before anything else on the screen.
  const timeSlots = await prisma.timeSlot.findMany({
    where: { deletedAt: null, type: { isLesson: true } },
    orderBy: { order: 'asc' },
  });
  if (subjects.length < SUBJECTS_PER_CLASS || teachers.length === 0) {
    throw new Error('Not enough subjects or teachers to teach anything.');
  }
  if (timeSlots.length === 0) {
    throw new Error('No lesson time slots to timetable on.');
  }

  const studentRole = await prisma.role.findFirst({
    where: { code: 'STUDENT' },
  });
  if (!studentRole) {
    throw new Error(
      'No STUDENT role. Run `pnpm seed:student-selfservice` first — it creates the role and its self-service grants.',
    );
  }

  // The teacher role could not teach.
  //
  // `iam.seed.ts` grants it twelve codes including `student-scores.manage`,
  // `assessment-items.*`, `attendances.manage` and `report-cards.publish`. Dev
  // was configured by hand instead and held none of them — a teacher could read
  // a classroom and a timetable and do nothing else, so the marking that fills
  // every screen downstream was impossible for the role that does it.
  //
  // Only added here, never removed. A fixture's job is to make its own
  // screens work, not to decide what a role holds — and taking a grant away
  // silently is worse than leaving one too many. Where a box has drifted the
  // other way, `pnpm --filter backend seed:iam` puts every built-in role back
  // to the list in `iam.seed.ts`, which is where that decision is written
  // down. Every code below is part of it.
  const teacherRole = await prisma.role.findFirst({
    where: { code: 'TEACHER' },
  });
  if (teacherRole) {
    const teacherCodes = [
      'attendances.read',
      'attendances.manage',
      'report-cards.read',
      'report-cards.publish',
      'report-cards.create',
      'assessment-items.read',
      'assessment-items.create',
      'assessment-items.update',
      'assessment-items.delete',
      'student-scores.read',
      // Scoped grading, not `student-scores.manage`: that one grades any class
      // in the school, and every teacher held it. This reaches the subjects
      // they are assigned to teach and the classroom they supervise, resolved
      // from those records rather than from what their role is called.
      'student-scores.manage-assigned',
      'student-scores.create',
      'student-scores.update',
      // The picker on the grading screen. Without it the dropdowns list every
      // class in the school, the teacher picks one they do not teach, and the
      // save is refused — a correct refusal that reads as a broken screen.
      'teaching-assignments.read-own',
      // A teacher's own teaching schedule comes through the same self-service
      // route a student's timetable does — feature 005 defined the code as
      // covering both — and the role held only the wide `schedules.read`, so
      // `/schedules/me` refused the person whose schedule it is.
      'schedules.read-own',
    ];
    const teacherPermissions = await prisma.permission.findMany({
      where: { code: { in: teacherCodes } },
    });
    for (const permission of teacherPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: teacherRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: { roleId: teacherRole.id, permissionId: permission.id },
      });
    }
    console.log(`  teacher role: ${teacherPermissions.length} teaching grants`);

    // Teachers holding no role at all.
    //
    // 24 of the 28 on this box had none: they could sign in, hold no
    // permission, and see an empty application with nothing saying why. That
    // is the exact failure `AccountProvisioningService` was changed to refuse —
    // it now throws when the role is missing rather than skipping — so these
    // are rows created before that fix, and a teacher imported today gets the
    // role properly. Repairing the old ones is left to a fixture because they
    // are dev data; production has no teachers yet.
    const roleless = await prisma.teacher.findMany({
      where: { deletedAt: null, user: { userRoles: { none: {} } } },
      select: { userId: true },
    });
    for (const row of roleless) {
      await prisma.userRole.create({
        data: { userId: row.userId, roleId: teacherRole.id },
      });
    }
    if (roleless.length > 0) {
      console.log(`  ${roleless.length} teachers given the TEACHER role`);
    }
  }

  const password = await bcrypt.hash('siswa123', 10);
  const teacherPassword = await bcrypt.hash('guru123', 10);
  const days = schoolDays(24);
  const enrollmentIds: { id: string; classroomId: string }[] = [];

  let nameCursor = 0;

  for (const [classIndex, classroom] of classrooms.entries()) {
    // The code already carries the grade — 'VII-A', not 'A' — so prefixing the
    // grade again gives 'VII-VII-A', and the sign-in names a demo types out
    // become siswa.vii-vii-a.001.
    const label = classroom.code;

    // 1. Who teaches what here. Subjects are taken in order so two classes of
    //    the same grade share a curriculum, and teachers round-robin across
    //    the whole staff list rather than one person teaching everything.
    const assignments: { id: string; subjectId: string }[] = [];
    for (let s = 0; s < SUBJECTS_PER_CLASS; s++) {
      const subject =
        subjects[(classIndex * SUBJECTS_PER_CLASS + s) % subjects.length];
      const teacher =
        teachers[(classIndex * SUBJECTS_PER_CLASS + s) % teachers.length];

      // A teacher who cannot sign in cannot be demonstrated. Only the ones
      // this fixture puts in front of a class get a known password — the rest
      // of the staff list is left alone, since these are real people's
      // accounts and a fixture has no business resetting all of them.
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { passwordHash: teacherPassword, isActive: true },
      });

      const assignment = await prisma.teachingAssignment.upsert({
        where: {
          teacherId_classroomId_subjectId_semesterId: {
            teacherId: teacher.id,
            classroomId: classroom.id,
            subjectId: subject.id,
            semesterId: semester.id,
          },
        },
        update: {},
        create: {
          teacherId: teacher.id,
          classroomId: classroom.id,
          subjectId: subject.id,
          semesterId: semester.id,
        },
      });
      assignments.push({ id: assignment.id, subjectId: subject.id });

      // How much each kind of assessment counts. Without these every type
      // weighs the same, and a final exam stops meaning more than a quiz.
      for (const weight of TYPE_WEIGHTS) {
        await prisma.assessmentWeight.upsert({
          where: {
            teachingAssignmentId_type: {
              teachingAssignmentId: assignment.id,
              type: weight.type,
            },
          },
          update: { weight: weight.weight },
          create: {
            teachingAssignmentId: assignment.id,
            type: weight.type,
            weight: weight.weight,
          },
        });
      }

      // 2. What is assessed. (When it is taught is decided for the whole
      //    school at once, further down — a timetable cannot be built one
      //    subject at a time without double-booking the teacher.)
      for (const spec of ASSESSMENTS) {
        const existingItem = await prisma.assessmentItem.findFirst({
          where: {
            teachingAssignmentId: assignment.id,
            name: spec.name,
            deletedAt: null,
          },
        });
        if (!existingItem) {
          await prisma.assessmentItem.create({
            data: {
              teachingAssignmentId: assignment.id,
              name: spec.name,
              type: spec.type,
              weight: spec.weight,
              maxScore: 100,
            },
          });
        }
      }
    }

    // 4. The children.
    for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
      const name = GIVEN_NAMES[nameCursor % GIVEN_NAMES.length];
      nameCursor++;
      const { identifier, nis, nisn, nik } = fixtureStudentKeys(
        label,
        classIndex,
        i,
      );

      const user = await prisma.user.upsert({
        where: { identifier },
        update: { isActive: true, deletedAt: null },
        create: { identifier, passwordHash: password, isActive: true },
      });

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: studentRole.id } },
        update: {},
        create: { userId: user.id, roleId: studentRole.id },
      });

      const existingProfile = await prisma.profile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile) {
        await prisma.profile.create({
          data: {
            userId: user.id,
            name,
            nik,
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            birthPlace: 'Bandung',
            birthDate: new Date(`2011-0${(i % 9) + 1}-1${i % 9}`),
          },
        });
      } else {
        await prisma.profile.update({
          where: { id: existingProfile.id },
          data: { name },
        });
      }

      const existingStudent = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      const student = existingStudent
        ? await prisma.student.update({
            where: { id: existingStudent.id },
            data: { gradeId: classroom.gradeId, deletedAt: null },
          })
        : await prisma.student.create({
            data: {
              userId: user.id,
              nis,
              nisn,
              gradeId: classroom.gradeId,
            },
          });

      const existingEnrolment = await prisma.studentEnrollment.findFirst({
        where: {
          studentId: student.id,
          semesterId: semester.id,
          deletedAt: null,
        },
      });
      const enrolment = existingEnrolment
        ? await prisma.studentEnrollment.update({
            where: { id: existingEnrolment.id },
            data: { classroomId: classroom.id },
          })
        : await prisma.studentEnrollment.create({
            data: {
              studentId: student.id,
              classroomId: classroom.id,
              semesterId: semester.id,
            },
          });

      enrollmentIds.push({ id: enrolment.id, classroomId: classroom.id });
    }
  }

  // Who teaches what, for the whole school: one teacher per subject, every
  // teacher holding something, every class studying everything. Done before
  // the timetable, which can only place what has been assigned.
  await seedTeachingPlan(
    prisma,
    semester.id,
    classrooms.map((classroom) => ({ id: classroom.id, code: classroom.code })),
  );

  // Every class's week at once — a timetable cannot be built one subject at a
  // time without standing the same teacher in two rooms at once.
  await seedTimetable(
    prisma,
    semester.id,
    classrooms.map((classroom) => ({ id: classroom.id, code: classroom.code })),
    await readPeriods(prisma),
  );

  console.log(`  ${classrooms.length} classrooms taught and assessed`);
  console.log(`  ${enrollmentIds.length} students enrolled`);

  // 5. Marks and attendance, for every enrolment in the active semester —
  //    including the two students the earlier fixture created, so they stop
  //    being the only ones with an empty rapor.
  const allEnrolments = await prisma.studentEnrollment.findMany({
    where: { semesterId: semester.id, deletedAt: null },
    include: { classroom: true },
  });

  let scoreCount = 0;
  let attendanceCount = 0;

  for (const [e, enrolment] of allEnrolments.entries()) {
    const items = await prisma.assessmentItem.findMany({
      where: {
        deletedAt: null,
        teachingAssignment: {
          classroomId: enrolment.classroomId,
          semesterId: semester.id,
          deletedAt: null,
        },
      },
    });

    for (const [k, item] of items.entries()) {
      const existing = await prisma.studentScore.findFirst({
        where: { enrollmentId: enrolment.id, assessmentItemId: item.id },
      });
      const score = markFor(e * 97 + k * 13);
      if (existing) {
        await prisma.studentScore.update({
          where: { id: existing.id },
          data: { score },
        });
      } else {
        await prisma.studentScore.create({
          data: {
            enrollmentId: enrolment.id,
            assessmentItemId: item.id,
            score,
          },
        });
      }
      scoreCount++;
    }

    for (const [d, date] of days.entries()) {
      const status = attendanceFor(e * 31 + d);
      // `findFirst` rather than `upsert`: the unique is (enrollment, date,
      // schedule) and these rows carry no schedule. Postgres treats each NULL
      // as distinct, so an upsert on that key would match nothing and insert a
      // second row every run — the fixture would grow a duplicate school every
      // time it was used.
      const existing = await prisma.attendance.findFirst({
        where: { enrollmentId: enrolment.id, date, scheduleId: null },
      });
      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status },
        });
      } else {
        await prisma.attendance.create({
          data: { enrollmentId: enrolment.id, date, status },
        });
      }
      attendanceCount++;
    }
  }

  console.log(`  ${scoreCount} marks, ${attendanceCount} attendance records`);

  // 6. The rapor, with its subject lines frozen.
  const generated: {
    enrollmentId: string;
    classroomId: string;
    average: number;
  }[] = [];

  for (const enrolment of allEnrolments) {
    const rows = await prisma.studentScore.findMany({
      where: { enrollmentId: enrolment.id, score: { not: null } },
      include: {
        assessmentItem: {
          include: {
            teachingAssignment: {
              include: {
                subject: true,
                classroom: true,
                assessmentWeights: true,
              },
            },
          },
        },
      },
    });

    const bySubject = new Map<string, SubjectGradeInput>();
    for (const row of rows) {
      if (row.score === null) continue;
      const assignment = row.assessmentItem.teachingAssignment;
      const subject = assignment.subject;

      let entry = bySubject.get(subject.id);
      if (!entry) {
        // The teacher's override for their own class first, then the
        // curriculum's figure for that grade and year, then the workspace
        // default for a subject taught but never listed. Same order as the use
        // case, and the one thing here worth re-checking if the two disagree.
        let passingScore = assignment.passingScore ?? null;
        if (passingScore === null) {
          const gradeYear = await prisma.gradeAcademicYear.findFirst({
            where: {
              gradeId: assignment.classroom.gradeId,
              academicYearId: assignment.classroom.academicYearId,
            },
            select: { curriculumId: true },
          });
          const curriculumSubject = gradeYear
            ? await prisma.curriculumSubject.findFirst({
                where: {
                  curriculumId: gradeYear.curriculumId,
                  subjectId: subject.id,
                },
                select: { passingScore: true },
              })
            : null;
          passingScore = curriculumSubject?.passingScore ?? null;
        }

        const typeWeights: SubjectGradeInput['typeWeights'] = {};
        for (const weight of assignment.assessmentWeights) {
          typeWeights[weight.type] = weight.weight;
        }

        entry = {
          subjectId: subject.id,
          subjectCode: subject.code ?? null,
          subjectName: subject.name,
          passingScore: passingScore ?? DEFAULT_PASSING_SCORE,
          typeWeights,
          assessments: [],
        };
        bySubject.set(subject.id, entry);
      }

      const assessment: ScoredAssessment = {
        type: row.assessmentItem.type,
        itemWeight: row.assessmentItem.weight,
        maxScore: row.assessmentItem.maxScore,
        score: row.score,
      };
      entry.assessments.push(assessment);
    }

    const graded = calculateSubjectGrades([...bySubject.values()]);
    const totalAverage = calculateTotalAverage(graded);

    const card = await prisma.reportCard.upsert({
      where: { enrollmentId: enrolment.id },
      update: { totalAverage, isPublished: false },
      create: { enrollmentId: enrolment.id, totalAverage },
    });

    // The lines are a snapshot, so they are replaced wholesale rather than
    // merged — a subject dropped from the timetable must leave the rapor too.
    await prisma.reportCardSubject.deleteMany({
      where: { reportCardId: card.id },
    });
    for (const row of graded) {
      await prisma.reportCardSubject.create({
        data: {
          reportCardId: card.id,
          subjectId: row.subjectId,
          subjectCode: row.code || null,
          subjectName: row.name,
          score: row.scoreValue,
          passingScore: row.passingScore,
          predicate: row.predicate,
          description: row.description,
          isComplete: row.isComplete,
        },
      });
    }

    generated.push({
      enrollmentId: enrolment.id,
      classroomId: enrolment.classroomId,
      average: totalAverage ?? 0,
    });
  }

  // Rank within the class, which is what a rank means. Ranking across the
  // school would put a first-former above a leaver for having easier subjects.
  const byClassroom = new Map<string, typeof generated>();
  for (const row of generated) {
    const list = byClassroom.get(row.classroomId) ?? [];
    list.push(row);
    byClassroom.set(row.classroomId, list);
  }

  let published = 0;
  for (const list of byClassroom.values()) {
    list.sort((a, b) => b.average - a.average);
    for (const [rank, row] of list.entries()) {
      await prisma.reportCard.updateMany({
        where: { enrollmentId: row.enrollmentId },
        data: { rank: rank + 1, isPublished: true },
      });
      published++;
    }
  }

  const lines = await prisma.reportCardSubject.count();
  console.log(
    `  ${published} report cards published, ${lines} subject lines frozen`,
  );
  console.log('\n── Around the classroom ──');
  await seedAnnouncements(prisma, classrooms);
  await seedGuardians(prisma);
  await seedClassroomStructures(prisma, semester.id, classrooms);
  await seedNonWorkingDays(prisma, openingYear);
  await seedAchievements(prisma, openingYear);

  console.log(
    '\n  students sign in with siswa123, teaching staff with guru123\n',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
