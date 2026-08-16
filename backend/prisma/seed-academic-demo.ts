import { PrismaPg } from '@prisma/adapter-pg';
import {
  AssessmentType,
  AttendanceStatus,
  Day,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
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
    ssl: { rejectUnauthorized: false },
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

const TEACHING_DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
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
  });
  if (!semester) throw new Error('No active semester on this box.');

  const classrooms = await prisma.classroom.findMany({
    where: { deletedAt: null },
    include: { grade: true },
    orderBy: { code: 'asc' },
  });
  if (classrooms.length === 0) throw new Error('No classrooms on this box.');

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
  // Only added here, never removed: what dev holds *beyond* this — including
  // `teachers.create` and `teachers.delete`, which let a teacher remove a
  // colleague — is the school's to decide on the role screen, not a fixture's
  // to quietly revoke.
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
      'parents.read',
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
  let nikCursor = 0;

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

      // 2. When it is taught. One period a week per subject, spread across the
      //    days so a timetable reads like a timetable.
      //
      //    The subject's whole timetable is replaced rather than added to.
      //    Creating only what is missing is idempotent until the rule that
      //    picks the slot changes, and then it is not: moving lessons out of
      //    the break periods left the old rows in place beside the new ones,
      //    and every subject appeared twice. A fixture has to converge on the
      //    same timetable however the last version left it.
      const day = TEACHING_DAYS[s % TEACHING_DAYS.length];
      const slot = timeSlots[(classIndex + s) % timeSlots.length];
      await prisma.schedule.deleteMany({
        where: { teachingAssignmentId: assignment.id },
      });
      await prisma.schedule.create({
        data: {
          teachingAssignmentId: assignment.id,
          timeSlotId: slot.id,
          day,
          room: label,
        },
      });

      // 3. What is assessed.
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
      const serial = String(classIndex * STUDENTS_PER_CLASS + i + 1).padStart(
        3,
        '0',
      );
      const identifier = `siswa.${label.toLowerCase()}.${serial}`;
      const nis = `2460${serial}`;
      const nisn = `00912360${serial}`;
      const nik = `3573061201${String(200000 + nikCursor).padStart(6, '0')}`;
      nikCursor++;

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

  console.log(
    `  ${classrooms.length} classrooms taught, timetabled and assessed`,
  );
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
