import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { seedEducations } from './seeds/modules/education.seed.js';
import { seedOccupations } from './seeds/modules/occupation.seed.js';
import { seedSocialMedias } from './seeds/modules/social-media.seed.js';
import { seedPositions } from './seeds/modules/position.seed.js';
import { seedLookupData } from './seeds/modules/lookup.seed.js';
import { seedReligions } from './seeds/modules/religion.seed.js';
import { seedBloodTypes } from './seeds/modules/blood-type.seed.js';
import { seedAchievementTypes } from './seeds/modules/achievement-type.seed.js';
import { seedAcademicCalendarTypes } from './seeds/modules/academic-calendar-type.seed.js';
import { seedSemesterTypes } from './seeds/modules/semester-type.seed.js';

import { seedAdmin } from './seeds/modules/admin.seed.js';
import { seedSchoolUnit } from './seeds/modules/school-unit.seed.js';
import { seedIam } from './seeds/modules/iam.seed.js';

import { seedAcademicYear } from './seeds/modules/academic-year.seed.js';
import { seedCurriculumSubjects } from './seeds/modules/curriculum-subject.seed.js';
import { seedCurricula } from './seeds/modules/curriculum.seed.js';
import { seedSemesters } from './seeds/modules/semester.seed.js';
import { seedSubjects } from './seeds/modules/subject.seed.js';

import { seedTeacherPositions } from './seeds/modules/teacher-position.seed.js';
import { seedTeachersOnly } from './seeds/modules/teacher.seed.js';

import { seedClassSupervisors } from './seeds/modules/classroom-supervisor.seed.js';
import { seedClasses } from './seeds/modules/classroom.seed.js';

import { seedParents } from './seeds/modules/parent.seed.js';

import { seedStudentEnrollments } from './seeds/modules/student-enrollment.seed.js';
import { seedStudentParents } from './seeds/modules/student-parent.seed.js';
import { seedStudents } from './seeds/modules/student.seed.js';

import { seedSchedules } from './seeds/modules/schedule.seed.js';
import { seedTeachingAssignments } from './seeds/modules/teaching-assignment.seed.js';
import { seedTimeSlots } from './seeds/modules/time-slot.seed.js';

import { seedAssessmentItems } from './seeds/modules/assessment-item.seed.js';
import { seedStudentScores } from './seeds/modules/student-score.seed.js';

import { seedAcademicCalendar } from './seeds/modules/academic-calendar.seed.js';

import {
  seedAnnouncements,
  seedEvents,
} from './seeds/modules/activities.seed.js';

import { seedAttendances } from './seeds/modules/attendance.seed.js';
import { seedReportCards } from './seeds/modules/report-card.seed.js';

import { seedProfileExtras } from './seeds/modules/profile-extras.seed.js';

import { seedAdmission } from './seeds/modules/admission.seed.js';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for seeding');
}
const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║   SIAKAD Database Seeder         ║');
  console.log('╚══════════════════════════════════╝\n');

  console.log('── Lookups ──');
  const { seededUnitTypes } = await seedLookupData(prisma);
  await seedSocialMedias(prisma);
  await seedEducations(prisma);
  await seedOccupations(prisma);
  await seedPositions(prisma);
  await seedReligions(prisma);
  await seedBloodTypes(prisma);
  await seedAchievementTypes(prisma);
  await seedAcademicCalendarTypes(prisma);
  await seedSemesterTypes(prisma);

  console.log('\n── School Unit ──');
  const { schoolUnit } = await seedSchoolUnit(
    prisma,
    seededUnitTypes['SMP'] ?? null,
  );
  console.log('\n-- Admin User --');
  await seedAdmin(prisma);
  console.log('\n-- IAM Roles and Permissions --');
  await seedIam(prisma);

  console.log('\n── Academic Structure ──');
  const academicYear = await seedAcademicYear(prisma, schoolUnit.id);
  const semesters = await seedSemesters(prisma, academicYear.id);
  const curriculum = await seedCurricula(
    prisma,
    academicYear.id,
    schoolUnit.id,
  );
  await seedSubjects(prisma);
  await seedCurriculumSubjects(prisma, curriculum.id);

  const allSemesters = await prisma.semester.findMany({
    where: { academicYearId: academicYear.id, deletedAt: null },
  });
  const activeSemester =
    allSemesters.find((s) => s.isActive) ?? allSemesters[0];

  console.log('\n── Employees ──');
  const teachers = await seedTeachersOnly(prisma, schoolUnit.id);
  await seedTeacherPositions(prisma, teachers);

  console.log('\n── Classes ──');
  const classes = await seedClasses(prisma, curriculum.id, academicYear.id);

  if (activeSemester) {
    await seedClassSupervisors(prisma, classes, teachers, activeSemester.id);
  }

  console.log('\n── Parents ──');
  const parents = await seedParents(prisma);

  console.log('\n── Students ──');
  const students = await seedStudents(prisma, classes, schoolUnit.id);

  console.log('\n── Student-Parent Links ──');
  await seedStudentParents(prisma, students, parents);

  console.log('\n── Student Enrollments ──');
  let enrollments: { id: string; classroomId: string }[] = [];
  if (activeSemester) {
    enrollments = await seedStudentEnrollments(
      prisma,
      activeSemester.id,
      classes,
    );
  }

  console.log('\n── Teaching & Scheduling ──');
  await seedTimeSlots(prisma, schoolUnit.id);

  let teachingAssignments: { id: string; classroomId: string }[] = [];
  if (activeSemester) {
    teachingAssignments = await seedTeachingAssignments(
      prisma,
      classes,
      teachers,
      activeSemester.id,
    );
  }
  await seedSchedules(prisma, teachingAssignments);

  console.log('\n── Assessment & Scores ──');
  const assessmentItems = await seedAssessmentItems(
    prisma,
    teachingAssignments,
  );
  if (assessmentItems.length > 0) {
    await seedStudentScores(prisma, enrollments);
  }

  console.log('\n── Academic Calendar ──');
  await seedAcademicCalendar(prisma, academicYear.id, semesters);

  console.log('\n── Activities ──');
  await seedEvents(prisma, classes, schoolUnit.id);
  await seedAnnouncements(prisma, classes);

  console.log('\n── Report Card & Attendance ──');
  if (activeSemester) {
    await seedReportCards(prisma, enrollments);
    await seedAttendances(prisma, enrollments);
  }

  console.log('\n── Profile Extras ──');
  await seedProfileExtras(prisma);

  console.log('\n── Admission ──');
  await seedAdmission(prisma);

  console.log('\n╔══════════════════════════════════╗');
  console.log('║  ✓ Seed completed successfully   ║');
  console.log('╚══════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
