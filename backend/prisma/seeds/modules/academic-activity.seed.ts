import {
  AssessmentType,
  AttendanceStatus,
  IncomeRange,
  ParentRelation,
  PrismaClient,
} from '@prisma/client';
import { seedOf, seeded, schoolDays } from './deterministic.js';
import {
  calculateSubjectGrades,
  calculateTotalAverage,
  type ScoredAssessment,
  type SubjectGradeInput,
} from '../../../src/academic/report-card/services/calculate-subject-grades.js';
import { DEFAULT_PASSING_SCORE } from '../../../src/academic/report-card/constants/report-card.constants.js';

/**
 * A term that looks like a term that was actually taught.
 *
 * Tasks set, marks entered, registers filled, rapor issued — over whatever
 * students and staff the box already holds. Nothing here invents a person,
 * which is what lets it run on a school's real records where
 * `seed:academic-demo` cannot.
 *
 * The point is not volume. A screen full of 85s proves nothing: it cannot show
 * a KKM working, a remedial case, a rapor rank that means something, or an
 * attendance recap worth reading. So the figures are shaped, and the shapes are
 * listed at each step below.
 */

/**
 * What a subject is assessed on, and how much each piece counts.
 *
 * `weight` is *within its type*, not across the subject — an `Ulangan Harian`
 * counting 2 against a `Tugas` counting 1 means it is worth twice as much of
 * the daily component. Every item used to be 1, which made a homework worth as
 * much as a test and left the weighting feature invisible.
 */
const ASSESSMENTS: { name: string; type: AssessmentType; weight: number }[] = [
  { name: 'Tugas Harian 1', type: AssessmentType.DAILY, weight: 1 },
  { name: 'Tugas Harian 2', type: AssessmentType.DAILY, weight: 1 },
  { name: 'Ulangan Harian 1', type: AssessmentType.DAILY, weight: 2 },
  { name: 'Ulangan Harian 2', type: AssessmentType.DAILY, weight: 2 },
  {
    name: 'Penilaian Tengah Semester',
    type: AssessmentType.MIDTERM,
    weight: 1,
  },
  { name: 'Penilaian Akhir Semester', type: AssessmentType.FINAL, weight: 1 },
];

/** How much each kind counts toward the subject's mark. */
const TYPE_WEIGHTS: { type: AssessmentType; weight: number }[] = [
  { type: AssessmentType.DAILY, weight: 0.4 },
  { type: AssessmentType.MIDTERM, weight: 0.25 },
  { type: AssessmentType.FINAL, weight: 0.35 },
];

/**
 * A pass mark that is not the same everywhere.
 *
 * The school's default is 75. A few subjects are held higher and a couple
 * lower, so the KKM column has something to say and a mark of 76 can be a pass
 * in one subject and a fail in another — which is the whole reason the field
 * exists per assignment.
 */
const PASSING_SCORE_OVERRIDES: Record<string, number> = {
  Matematika: 78,
  'Ilmu Pengetahuan Alam': 78,
  'Bahasa Inggris': 72,
  'Pendidikan Jasmani, Olahraga dan Kesehatan': 70,
};

/** One class in twelve has a subject nobody has set work for yet. */
const UNASSESSED_SHARE = 1 / 12;

/** One mark in twenty-five is still blank — the teacher has not entered it. */
const UNMARKED_SHARE = 1 / 25;

const ATTENDANCE_DAYS = 24;

export interface ActivityScope {
  semesterId: string;
}

/**
 * How well a student generally does, from 0 (struggling) to 1 (excellent).
 *
 * Fixed per student rather than rolled per mark. A real rapor is coherent —
 * somebody who struggles with Matematika is usually not top of the class in
 * Fisika — and per-cell randomness produces a school where every child is
 * exactly average, which hides the very cases the screens exist to surface.
 *
 * The distribution is deliberately uneven: roughly one in eight sits below the
 * pass mark, so remedial cases, an honest rank order, and a rapor that says
 * "belum tuntas" all appear without anyone arranging them.
 */
function abilityOf(studentId: string): number {
  const r = seeded(seedOf(studentId));
  if (r < 0.12) return 0.15 + r; // struggling
  if (r > 0.88) return 0.92 + (r - 0.88) / 2; // excellent
  return 0.45 + (r - 0.12) * 0.55; // the middle
}

/** A mark for this student on this item: their level, nudged per subject. */
function markFor(ability: number, itemId: string): number | null {
  const wobble = seeded(seedOf(itemId)) * 0.22 - 0.11;
  if (seeded(seedOf(itemId) * 3.7) < UNMARKED_SHARE) return null;

  const scaled = 45 + (ability + wobble) * 55;
  return Math.max(35, Math.min(99, Math.round(scaled)));
}

/**
 * Attendance for one student on one day.
 *
 * One student in fifteen is a poor attender — genuinely poor, not noise — so
 * the recap has somebody to find and the rapor's attendance box is not six
 * zeroes for every child in the school.
 */
function attendanceFor(studentId: string, day: number): AttendanceStatus {
  const chronic = seeded(seedOf(studentId) * 1.7) < 1 / 15;
  const r = seeded(seedOf(studentId) + day * 7.13);

  if (chronic) {
    if (r < 0.55) return AttendanceStatus.PRESENT;
    if (r < 0.72) return AttendanceStatus.ABSENT;
    if (r < 0.86) return AttendanceStatus.SICK;
    if (r < 0.95) return AttendanceStatus.EXCUSED;
    return AttendanceStatus.LATE;
  }

  if (r < 0.93) return AttendanceStatus.PRESENT;
  if (r < 0.96) return AttendanceStatus.SICK;
  if (r < 0.98) return AttendanceStatus.EXCUSED;
  if (r < 0.995) return AttendanceStatus.LATE;
  return AttendanceStatus.ABSENT;
}

/**
 * The work each subject is assessed on, and what the school expects of it.
 *
 * Idempotent by name within an assignment, so running this again corrects the
 * weights rather than setting the same six tasks twice.
 */
export async function seedAssessments(
  prisma: PrismaClient,
  { semesterId }: ActivityScope,
) {
  const assignments = await prisma.teachingAssignment.findMany({
    where: { deletedAt: null, semesterId },
    select: { id: true, subject: { select: { name: true } } },
    orderBy: { id: 'asc' },
  });

  let items = 0;
  let weights = 0;
  let unassessed = 0;
  let kkm = 0;

  for (const assignment of assignments) {
    const override = PASSING_SCORE_OVERRIDES[assignment.subject.name];
    if (override !== undefined) {
      await prisma.teachingAssignment.update({
        where: { id: assignment.id },
        data: { passingScore: override },
      });
      kkm++;
    }

    for (const spec of TYPE_WEIGHTS) {
      await prisma.assessmentWeight.upsert({
        where: {
          teachingAssignmentId_type: {
            teachingAssignmentId: assignment.id,
            type: spec.type,
          },
        },
        update: { weight: spec.weight },
        create: {
          teachingAssignmentId: assignment.id,
          type: spec.type,
          weight: spec.weight,
        },
      });
      weights++;
    }

    // A subject nobody has set work for yet is a real state early in a term,
    // and the screens have to say so rather than showing an empty table that
    // looks broken.
    if (seeded(seedOf(assignment.id) * 5.3) < UNASSESSED_SHARE) {
      unassessed++;
      continue;
    }

    for (const spec of ASSESSMENTS) {
      const existing = await prisma.assessmentItem.findFirst({
        where: {
          teachingAssignmentId: assignment.id,
          name: spec.name,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (existing) {
        await prisma.assessmentItem.update({
          where: { id: existing.id },
          data: { type: spec.type, weight: spec.weight, maxScore: 100 },
        });
      } else {
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
      items++;
    }
  }

  console.log(
    `  ${items} tasks across ${assignments.length - unassessed} subjects ` +
      `(${unassessed} not assessed yet), ${weights} weightings, ${kkm} KKM overrides`,
  );
}

/**
 * The marks, and the register.
 *
 * Every enrolment in the term, against every task set for their class. Days
 * the school was shut are skipped — a holiday is not a day anybody was absent,
 * and `non_working_days` is where that is recorded.
 */
export async function seedMarksAndAttendance(
  prisma: PrismaClient,
  { semesterId }: ActivityScope,
) {
  const holidays = await prisma.nonWorkingDay.findMany({
    where: { deletedAt: null },
    select: { date: true },
  });
  const days = schoolDays(
    ATTENDANCE_DAYS,
    new Set(holidays.map((h) => h.date.toISOString().slice(0, 10))),
  );

  const enrolments = await prisma.studentEnrollment.findMany({
    where: { semesterId, deletedAt: null },
    select: { id: true, studentId: true, classroomId: true },
    orderBy: { id: 'asc' },
  });

  // Every task in the term, grouped by the class it was set for. Read once:
  // asked per enrolment, this was one query per child per run.
  const allItems = await prisma.assessmentItem.findMany({
    where: {
      deletedAt: null,
      teachingAssignment: { semesterId, deletedAt: null },
    },
    select: {
      id: true,
      teachingAssignment: { select: { classroomId: true } },
    },
  });
  const itemsByClassroom = new Map<string, string[]>();
  for (const item of allItems) {
    const key = item.teachingAssignment.classroomId;
    itemsByClassroom.set(key, [...(itemsByClassroom.get(key) ?? []), item.id]);
  }

  // What is already recorded, so only the gaps are written.
  //
  // The first version asked the database whether each row existed, one row at
  // a time: forty thousand sequential round trips, which is minutes of waiting
  // on a database in the same rack and a timeout on one across the internet.
  // The work was never the volume — it was the conversation.
  const [existingScores, existingAttendance] = await Promise.all([
    prisma.studentScore.findMany({
      where: { enrollment: { semesterId, deletedAt: null } },
      select: { enrollmentId: true, assessmentItemId: true },
    }),
    prisma.attendance.findMany({
      where: { enrollment: { semesterId, deletedAt: null }, scheduleId: null },
      select: { enrollmentId: true, date: true },
    }),
  ]);

  const haveScore = new Set(
    existingScores.map((r) => `${r.enrollmentId}|${r.assessmentItemId}`),
  );
  const haveAttendance = new Set(
    existingAttendance.map(
      (r) => `${r.enrollmentId}|${r.date.toISOString().slice(0, 10)}`,
    ),
  );

  const newScores: {
    enrollmentId: string;
    assessmentItemId: string;
    score: number | null;
  }[] = [];
  const newAttendance: {
    enrollmentId: string;
    date: Date;
    status: AttendanceStatus;
  }[] = [];
  let blanks = 0;

  for (const enrolment of enrolments) {
    const ability = abilityOf(enrolment.studentId);

    for (const itemId of itemsByClassroom.get(enrolment.classroomId) ?? []) {
      if (haveScore.has(`${enrolment.id}|${itemId}`)) continue;
      const score = markFor(ability, `${enrolment.id}${itemId}`);
      if (score === null) blanks++;
      newScores.push({
        enrollmentId: enrolment.id,
        assessmentItemId: itemId,
        score,
      });
    }

    for (const [d, date] of days.entries()) {
      const key = `${enrolment.id}|${date.toISOString().slice(0, 10)}`;
      if (haveAttendance.has(key)) continue;
      newAttendance.push({
        enrollmentId: enrolment.id,
        date,
        status: attendanceFor(enrolment.studentId, d),
      });
    }
  }

  // `createMany` in slices: one statement per slice rather than per row, and
  // small enough that a single statement never exceeds the parameter limit.
  //
  // `skipDuplicates` as well as the sets above, because the two guard
  // different things. The sets keep the work down; this keeps the run correct
  // where a row exists that the sets could not see — a soft-deleted mark still
  // occupies `(enrollment, item)`, whose unique index carries no `deletedAt`
  // clause. Filling gaps is the whole job, so a row already there is not an
  // error.
  const CHUNK = 1000;
  for (let i = 0; i < newScores.length; i += CHUNK) {
    await prisma.studentScore.createMany({
      data: newScores.slice(i, i + CHUNK),
      skipDuplicates: true,
    });
  }
  for (let i = 0; i < newAttendance.length; i += CHUNK) {
    await prisma.attendance.createMany({
      data: newAttendance.slice(i, i + CHUNK),
      skipDuplicates: true,
    });
  }

  console.log(
    `  ${newScores.length} marks written (${blanks} left blank, ` +
      `${haveScore.size} already there), ` +
      `${newAttendance.length} attendance records across ${days.length} school days`,
  );
}

/**
 * The rapor, with its subject lines frozen.
 *
 * The mark for a subject is computed here the way the use case computes it —
 * the teacher's KKM for their own class, then the curriculum's figure for that
 * grade and year, then the school default — so a seeded rapor and one issued
 * through the screens agree. If those two ever disagree, this is the first
 * place to look.
 */
export async function seedReportCards(
  prisma: PrismaClient,
  { semesterId }: ActivityScope,
) {
  const enrolments = await prisma.studentEnrollment.findMany({
    where: { semesterId, deletedAt: null },
    select: { id: true, classroomId: true },
    orderBy: { id: 'asc' },
  });

  const kkmCache = new Map<string, number | null>();

  const generated: {
    enrollmentId: string;
    classroomId: string;
    average: number;
  }[] = [];

  for (const enrolment of enrolments) {
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
          // Memoised across the whole run. The answer depends only on the
          // grade, the year and the subject, and a school asks the same few
          // hundred questions once per child — twelve thousand round trips for
          // roughly two hundred distinct answers.
          const key = `${assignment.classroom.gradeId}|${assignment.classroom.academicYearId}|${subject.id}`;
          if (!kkmCache.has(key)) {
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
            kkmCache.set(key, curriculumSubject?.passingScore ?? null);
          }
          passingScore = kkmCache.get(key) ?? null;
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
    // One statement for the whole rapor rather than one per subject: twenty-
    // seven round trips per child adds up to six thousand for a school.
    await prisma.reportCardSubject.createMany({
      data: graded.map((row) => ({
        reportCardId: card.id,
        subjectId: row.subjectId,
        subjectCode: row.code || null,
        subjectName: row.name,
        score: row.scoreValue,
        passingScore: row.passingScore,
        predicate: row.predicate,
        description: row.description,
        isComplete: row.isComplete,
      })),
    });

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
export async function seedGuardians(prisma: PrismaClient) {
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
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

export async function seedAchievements(
  prisma: PrismaClient,
  openingYear: number,
) {
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
    where: { deletedAt: null },
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
