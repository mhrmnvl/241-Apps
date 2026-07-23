import { SystemPermission } from '../types/system-permission.type.js';

// AUTO-GENERATED from every @RequirePermissions(...) used in the codebase.
// Each entry maps 1:1 to a guard code (module.action). Keep in sync when adding
// new guarded endpoints, then run `POST /permissions/sync` (or reseed).

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  // academic-calendar-types
  {
    module: 'academic-calendar-types',
    action: 'create',
    code: 'academic-calendar-types.create',
    description: 'Create academic calendar types',
  },
  {
    module: 'academic-calendar-types',
    action: 'delete',
    code: 'academic-calendar-types.delete',
    description: 'Delete academic calendar types',
  },
  {
    module: 'academic-calendar-types',
    action: 'read',
    code: 'academic-calendar-types.read',
    description: 'Read academic calendar types',
  },
  {
    module: 'academic-calendar-types',
    action: 'update',
    code: 'academic-calendar-types.update',
    description: 'Update academic calendar types',
  },

  // academic-calendars
  {
    module: 'academic-calendars',
    action: 'create',
    code: 'academic-calendars.create',
    description: 'Create academic calendars',
  },
  {
    module: 'academic-calendars',
    action: 'delete',
    code: 'academic-calendars.delete',
    description: 'Delete academic calendars',
  },
  {
    module: 'academic-calendars',
    action: 'read',
    code: 'academic-calendars.read',
    description: 'Read academic calendars',
  },
  {
    module: 'academic-calendars',
    action: 'update',
    code: 'academic-calendars.update',
    description: 'Update academic calendars',
  },

  // academic-years
  {
    module: 'academic-years',
    action: 'create',
    code: 'academic-years.create',
    description: 'Create academic years',
  },
  {
    module: 'academic-years',
    action: 'delete',
    code: 'academic-years.delete',
    description: 'Delete academic years',
  },
  {
    module: 'academic-years',
    action: 'read',
    code: 'academic-years.read',
    description: 'Read academic years',
  },
  {
    module: 'academic-years',
    action: 'update',
    code: 'academic-years.update',
    description: 'Update academic years',
  },

  // achievement-types
  {
    module: 'achievement-types',
    action: 'create',
    code: 'achievement-types.create',
    description: 'Create achievement types',
  },
  {
    module: 'achievement-types',
    action: 'delete',
    code: 'achievement-types.delete',
    description: 'Delete achievement types',
  },
  {
    module: 'achievement-types',
    action: 'read',
    code: 'achievement-types.read',
    description: 'Read achievement types',
  },
  {
    module: 'achievement-types',
    action: 'update',
    code: 'achievement-types.update',
    description: 'Update achievement types',
  },

  // achievements
  {
    module: 'achievements',
    action: 'create',
    code: 'achievements.create',
    description: 'Create achievements',
  },
  {
    module: 'achievements',
    action: 'delete',
    code: 'achievements.delete',
    description: 'Delete achievements',
  },
  {
    module: 'achievements',
    action: 'read',
    code: 'achievements.read',
    description: 'Read achievements',
  },
  {
    module: 'achievements',
    action: 'update',
    code: 'achievements.update',
    description: 'Update achievements',
  },

  // admission-announcements
  {
    module: 'admission-announcements',
    action: 'create',
    code: 'admission-announcements.create',
    description: 'Create admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'delete',
    code: 'admission-announcements.delete',
    description: 'Delete admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'read',
    code: 'admission-announcements.read',
    description: 'Read admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'update',
    code: 'admission-announcements.update',
    description: 'Update admission announcements',
  },

  // admission-waves
  {
    module: 'admission-waves',
    action: 'create',
    code: 'admission-waves.create',
    description: 'Create admission waves',
  },
  {
    module: 'admission-waves',
    action: 'delete',
    code: 'admission-waves.delete',
    description: 'Delete admission waves',
  },
  {
    module: 'admission-waves',
    action: 'read',
    code: 'admission-waves.read',
    description: 'Read admission waves',
  },
  {
    module: 'admission-waves',
    action: 'update',
    code: 'admission-waves.update',
    description: 'Update admission waves',
  },

  // admissions
  {
    module: 'admissions',
    action: 'decide',
    code: 'admissions.decide',
    description: 'Decide admissions',
  },
  {
    module: 'admissions',
    action: 'enroll',
    code: 'admissions.enroll',
    description: 'Enroll admissions',
  },
  {
    module: 'admissions',
    action: 'read',
    code: 'admissions.read',
    description: 'Read admissions',
  },
  {
    module: 'admissions',
    action: 'verify',
    code: 'admissions.verify',
    description: 'Verify admissions',
  },

  // announcements
  {
    module: 'announcements',
    action: 'create',
    code: 'announcements.create',
    description: 'Create announcements',
  },
  {
    module: 'announcements',
    action: 'delete',
    code: 'announcements.delete',
    description: 'Delete announcements',
  },
  {
    module: 'announcements',
    action: 'read',
    code: 'announcements.read',
    description: 'Read announcements',
  },
  {
    module: 'announcements',
    action: 'update',
    code: 'announcements.update',
    description: 'Update announcements',
  },

  // assessment-items
  {
    module: 'assessment-items',
    action: 'create',
    code: 'assessment-items.create',
    description: 'Create assessment items',
  },
  {
    module: 'assessment-items',
    action: 'delete',
    code: 'assessment-items.delete',
    description: 'Delete assessment items',
  },
  {
    module: 'assessment-items',
    action: 'read',
    code: 'assessment-items.read',
    description: 'Read assessment items',
  },
  {
    module: 'assessment-items',
    action: 'update',
    code: 'assessment-items.update',
    description: 'Update assessment items',
  },

  // attendances
  {
    module: 'attendances',
    action: 'delete',
    code: 'attendances.delete',
    description: 'Delete attendances',
  },
  {
    module: 'attendances',
    action: 'manage',
    code: 'attendances.manage',
    description: 'Manage attendances',
  },
  {
    module: 'attendances',
    action: 'read',
    code: 'attendances.read',
    description: 'Read attendances',
  },
  {
    module: 'attendances',
    action: 'update',
    code: 'attendances.update',
    description: 'Update attendances',
  },

  // audit-logs
  {
    module: 'audit-logs',
    action: 'read',
    code: 'audit-logs.read',
    description: 'Read audit logs',
  },

  // blood-types
  {
    module: 'blood-types',
    action: 'create',
    code: 'blood-types.create',
    description: 'Create blood types',
  },
  {
    module: 'blood-types',
    action: 'delete',
    code: 'blood-types.delete',
    description: 'Delete blood types',
  },
  {
    module: 'blood-types',
    action: 'read',
    code: 'blood-types.read',
    description: 'Read blood types',
  },
  {
    module: 'blood-types',
    action: 'update',
    code: 'blood-types.update',
    description: 'Update blood types',
  },

  // classrooms
  {
    module: 'classrooms',
    action: 'create',
    code: 'classrooms.create',
    description: 'Create classrooms',
  },
  {
    module: 'classrooms',
    action: 'delete',
    code: 'classrooms.delete',
    description: 'Delete classrooms',
  },
  {
    module: 'classrooms',
    action: 'read',
    code: 'classrooms.read',
    description: 'Read classrooms',
  },
  {
    module: 'classrooms',
    action: 'update',
    code: 'classrooms.update',
    description: 'Update classrooms',
  },

  // curricula
  {
    module: 'curricula',
    action: 'create',
    code: 'curricula.create',
    description: 'Create curricula',
  },
  {
    module: 'curricula',
    action: 'delete',
    code: 'curricula.delete',
    description: 'Delete curricula',
  },
  {
    module: 'curricula',
    action: 'read',
    code: 'curricula.read',
    description: 'Read curricula',
  },
  {
    module: 'curricula',
    action: 'update',
    code: 'curricula.update',
    description: 'Update curricula',
  },

  // curriculum-subjects
  {
    module: 'curriculum-subjects',
    action: 'create',
    code: 'curriculum-subjects.create',
    description: 'Create curriculum subjects',
  },
  {
    module: 'curriculum-subjects',
    action: 'delete',
    code: 'curriculum-subjects.delete',
    description: 'Delete curriculum subjects',
  },
  {
    module: 'curriculum-subjects',
    action: 'read',
    code: 'curriculum-subjects.read',
    description: 'Read curriculum subjects',
  },
  {
    module: 'curriculum-subjects',
    action: 'update',
    code: 'curriculum-subjects.update',
    description: 'Update curriculum subjects',
  },

  // dashboards
  {
    module: 'dashboards',
    action: 'read',
    code: 'dashboards.read',
    description: 'Read dashboards',
  },

  // educational-histories
  {
    module: 'educational-histories',
    action: 'create',
    code: 'educational-histories.create',
    description: 'Create educational histories',
  },
  {
    module: 'educational-histories',
    action: 'delete',
    code: 'educational-histories.delete',
    description: 'Delete educational histories',
  },
  {
    module: 'educational-histories',
    action: 'read',
    code: 'educational-histories.read',
    description: 'Read educational histories',
  },
  {
    module: 'educational-histories',
    action: 'update',
    code: 'educational-histories.update',
    description: 'Update educational histories',
  },

  // educations
  {
    module: 'educations',
    action: 'create',
    code: 'educations.create',
    description: 'Create educations',
  },
  {
    module: 'educations',
    action: 'delete',
    code: 'educations.delete',
    description: 'Delete educations',
  },
  {
    module: 'educations',
    action: 'read',
    code: 'educations.read',
    description: 'Read educations',
  },
  {
    module: 'educations',
    action: 'update',
    code: 'educations.update',
    description: 'Update educations',
  },

  // enrollments
  {
    module: 'enrollments',
    action: 'create',
    code: 'enrollments.create',
    description: 'Create enrollments',
  },
  {
    module: 'enrollments',
    action: 'delete',
    code: 'enrollments.delete',
    description: 'Delete enrollments',
  },
  {
    module: 'enrollments',
    action: 'read',
    code: 'enrollments.read',
    description: 'Read enrollments',
  },
  {
    module: 'enrollments',
    action: 'update',
    code: 'enrollments.update',
    description: 'Update enrollments',
  },

  // events
  {
    module: 'events',
    action: 'create',
    code: 'events.create',
    description: 'Create events',
  },
  {
    module: 'events',
    action: 'delete',
    code: 'events.delete',
    description: 'Delete events',
  },
  {
    module: 'events',
    action: 'read',
    code: 'events.read',
    description: 'Read events',
  },
  {
    module: 'events',
    action: 'update',
    code: 'events.update',
    description: 'Update events',
  },

  // files
  {
    module: 'files',
    action: 'create',
    code: 'files.create',
    description: 'Create files',
  },
  {
    module: 'files',
    action: 'delete',
    code: 'files.delete',
    description: 'Delete files',
  },
  {
    module: 'files',
    action: 'read',
    code: 'files.read',
    description: 'Read files',
  },

  // graduations
  {
    module: 'graduations',
    action: 'create',
    code: 'graduations.create',
    description: 'Create graduations',
  },
  {
    module: 'graduations',
    action: 'delete',
    code: 'graduations.delete',
    description: 'Delete graduations',
  },
  {
    module: 'graduations',
    action: 'read',
    code: 'graduations.read',
    description: 'Read graduations',
  },
  {
    module: 'graduations',
    action: 'update',
    code: 'graduations.update',
    description: 'Update graduations',
  },

  // inventory
  {
    module: 'inventory',
    action: 'create',
    code: 'inventory.create',
    description: 'Create inventory',
  },
  {
    module: 'inventory',
    action: 'delete',
    code: 'inventory.delete',
    description: 'Delete inventory',
  },
  {
    module: 'inventory',
    action: 'read',
    code: 'inventory.read',
    description: 'Read inventory',
  },
  {
    module: 'inventory',
    action: 'update',
    code: 'inventory.update',
    description: 'Update inventory',
  },

  // occupations
  {
    module: 'occupations',
    action: 'create',
    code: 'occupations.create',
    description: 'Create occupations',
  },
  {
    module: 'occupations',
    action: 'delete',
    code: 'occupations.delete',
    description: 'Delete occupations',
  },
  {
    module: 'occupations',
    action: 'read',
    code: 'occupations.read',
    description: 'Read occupations',
  },
  {
    module: 'occupations',
    action: 'update',
    code: 'occupations.update',
    description: 'Update occupations',
  },

  // parents
  {
    module: 'parents',
    action: 'create',
    code: 'parents.create',
    description: 'Create parents',
  },
  {
    module: 'parents',
    action: 'delete',
    code: 'parents.delete',
    description: 'Delete parents',
  },
  {
    module: 'parents',
    action: 'read',
    code: 'parents.read',
    description: 'Read parents',
  },
  {
    module: 'parents',
    action: 'update',
    code: 'parents.update',
    description: 'Update parents',
  },

  // permissions
  {
    module: 'permissions',
    action: 'manage',
    code: 'permissions.manage',
    description: 'Manage permissions',
  },

  // positions
  {
    module: 'positions',
    action: 'create',
    code: 'positions.create',
    description: 'Create positions',
  },
  {
    module: 'positions',
    action: 'delete',
    code: 'positions.delete',
    description: 'Delete positions',
  },
  {
    module: 'positions',
    action: 'read',
    code: 'positions.read',
    description: 'Read positions',
  },
  {
    module: 'positions',
    action: 'update',
    code: 'positions.update',
    description: 'Update positions',
  },

  // profiles
  {
    module: 'profiles',
    action: 'create',
    code: 'profiles.create',
    description: 'Create profiles',
  },
  {
    module: 'profiles',
    action: 'delete',
    code: 'profiles.delete',
    description: 'Delete profiles',
  },
  {
    module: 'profiles',
    action: 'read',
    code: 'profiles.read',
    description: 'Read profiles',
  },
  {
    module: 'profiles',
    action: 'update',
    code: 'profiles.update',
    description: 'Update profiles',
  },

  // religions
  {
    module: 'religions',
    action: 'create',
    code: 'religions.create',
    description: 'Create religions',
  },
  {
    module: 'religions',
    action: 'delete',
    code: 'religions.delete',
    description: 'Delete religions',
  },
  {
    module: 'religions',
    action: 'read',
    code: 'religions.read',
    description: 'Read religions',
  },
  {
    module: 'religions',
    action: 'update',
    code: 'religions.update',
    description: 'Update religions',
  },

  // report-cards
  {
    module: 'report-cards',
    action: 'create',
    code: 'report-cards.create',
    description: 'Create report cards',
  },
  {
    module: 'report-cards',
    action: 'delete',
    code: 'report-cards.delete',
    description: 'Delete report cards',
  },
  {
    module: 'report-cards',
    action: 'publish',
    code: 'report-cards.publish',
    description: 'Publish report cards',
  },
  {
    module: 'report-cards',
    action: 'read',
    code: 'report-cards.read',
    description: 'Read report cards',
  },
  {
    module: 'report-cards',
    action: 'update',
    code: 'report-cards.update',
    description: 'Update report cards',
  },

  // roles
  {
    module: 'roles',
    action: 'assign',
    code: 'roles.assign',
    description: 'Assign roles',
  },
  {
    module: 'roles',
    action: 'create',
    code: 'roles.create',
    description: 'Create roles',
  },
  {
    module: 'roles',
    action: 'delete',
    code: 'roles.delete',
    description: 'Delete roles',
  },
  {
    module: 'roles',
    action: 'read',
    code: 'roles.read',
    description: 'Read roles',
  },
  {
    module: 'roles',
    action: 'update',
    code: 'roles.update',
    description: 'Update roles',
  },

  // schedules
  {
    module: 'schedules',
    action: 'create',
    code: 'schedules.create',
    description: 'Create schedules',
  },
  {
    module: 'schedules',
    action: 'delete',
    code: 'schedules.delete',
    description: 'Delete schedules',
  },
  {
    module: 'schedules',
    action: 'read',
    code: 'schedules.read',
    description: 'Read schedules',
  },
  {
    module: 'schedules',
    action: 'update',
    code: 'schedules.update',
    description: 'Update schedules',
  },

  // scholarships
  {
    module: 'scholarships',
    action: 'create',
    code: 'scholarships.create',
    description: 'Create scholarships',
  },
  {
    module: 'scholarships',
    action: 'delete',
    code: 'scholarships.delete',
    description: 'Delete scholarships',
  },
  {
    module: 'scholarships',
    action: 'read',
    code: 'scholarships.read',
    description: 'Read scholarships',
  },
  {
    module: 'scholarships',
    action: 'update',
    code: 'scholarships.update',
    description: 'Update scholarships',
  },

  // school-units
  {
    module: 'school-units',
    action: 'create',
    code: 'school-units.create',
    description: 'Create school units',
  },
  {
    module: 'school-units',
    action: 'delete',
    code: 'school-units.delete',
    description: 'Delete school units',
  },
  {
    module: 'school-units',
    action: 'read',
    code: 'school-units.read',
    description: 'Read school units',
  },
  {
    module: 'school-units',
    action: 'update',
    code: 'school-units.update',
    description: 'Update school units',
  },

  // semesters
  {
    module: 'semesters',
    action: 'create',
    code: 'semesters.create',
    description: 'Create semesters',
  },
  {
    module: 'semesters',
    action: 'delete',
    code: 'semesters.delete',
    description: 'Delete semesters',
  },
  {
    module: 'semesters',
    action: 'read',
    code: 'semesters.read',
    description: 'Read semesters',
  },
  {
    module: 'semesters',
    action: 'update',
    code: 'semesters.update',
    description: 'Update semesters',
  },

  // sessions
  {
    module: 'sessions',
    action: 'create',
    code: 'sessions.create',
    description: 'Create sessions',
  },
  {
    module: 'sessions',
    action: 'read',
    code: 'sessions.read',
    description: 'Read sessions',
  },

  // social-media
  {
    module: 'social-media',
    action: 'create',
    code: 'social-media.create',
    description: 'Create social media',
  },
  {
    module: 'social-media',
    action: 'delete',
    code: 'social-media.delete',
    description: 'Delete social media',
  },
  {
    module: 'social-media',
    action: 'read',
    code: 'social-media.read',
    description: 'Read social media',
  },
  {
    module: 'social-media',
    action: 'update',
    code: 'social-media.update',
    description: 'Update social media',
  },

  // student-scores
  {
    module: 'student-scores',
    action: 'create',
    code: 'student-scores.create',
    description: 'Create student scores',
  },
  {
    module: 'student-scores',
    action: 'delete',
    code: 'student-scores.delete',
    description: 'Delete student scores',
  },
  {
    module: 'student-scores',
    action: 'manage',
    code: 'student-scores.manage',
    description:
      'Manage student scores (bulk grade a class for one assessment item)',
  },
  {
    module: 'student-scores',
    action: 'read',
    code: 'student-scores.read',
    description: 'Read student scores',
  },
  {
    module: 'student-scores',
    action: 'update',
    code: 'student-scores.update',
    description: 'Update student scores',
  },

  // students
  {
    module: 'students',
    action: 'create',
    code: 'students.create',
    description: 'Create students',
  },
  {
    module: 'students',
    action: 'delete',
    code: 'students.delete',
    description: 'Delete students',
  },
  {
    module: 'students',
    action: 'read',
    code: 'students.read',
    description: 'Read students',
  },
  {
    module: 'students',
    action: 'update',
    code: 'students.update',
    description: 'Update students',
  },

  // subjects
  {
    module: 'subjects',
    action: 'create',
    code: 'subjects.create',
    description: 'Create subjects',
  },
  {
    module: 'subjects',
    action: 'delete',
    code: 'subjects.delete',
    description: 'Delete subjects',
  },
  {
    module: 'subjects',
    action: 'read',
    code: 'subjects.read',
    description: 'Read subjects',
  },
  {
    module: 'subjects',
    action: 'update',
    code: 'subjects.update',
    description: 'Update subjects',
  },

  // teachers
  {
    module: 'teachers',
    action: 'create',
    code: 'teachers.create',
    description: 'Create teachers',
  },
  {
    module: 'teachers',
    action: 'delete',
    code: 'teachers.delete',
    description: 'Delete teachers',
  },
  {
    module: 'teachers',
    action: 'read',
    code: 'teachers.read',
    description: 'Read teachers',
  },
  {
    module: 'teachers',
    action: 'update',
    code: 'teachers.update',
    description: 'Update teachers',
  },

  // teaching-assignments
  {
    module: 'teaching-assignments',
    action: 'create',
    code: 'teaching-assignments.create',
    description: 'Create teaching assignments',
  },
  {
    module: 'teaching-assignments',
    action: 'delete',
    code: 'teaching-assignments.delete',
    description: 'Delete teaching assignments',
  },
  {
    module: 'teaching-assignments',
    action: 'read',
    code: 'teaching-assignments.read',
    description: 'Read teaching assignments',
  },
  {
    module: 'teaching-assignments',
    action: 'update',
    code: 'teaching-assignments.update',
    description: 'Update teaching assignments',
  },

  // time-slots
  {
    module: 'time-slots',
    action: 'create',
    code: 'time-slots.create',
    description: 'Create time slots',
  },
  {
    module: 'time-slots',
    action: 'delete',
    code: 'time-slots.delete',
    description: 'Delete time slots',
  },
  {
    module: 'time-slots',
    action: 'read',
    code: 'time-slots.read',
    description: 'Read time slots',
  },
  {
    module: 'time-slots',
    action: 'update',
    code: 'time-slots.update',
    description: 'Update time slots',
  },

  // users
  {
    module: 'users',
    action: 'create',
    code: 'users.create',
    description: 'Create users',
  },
  {
    module: 'users',
    action: 'delete',
    code: 'users.delete',
    description: 'Delete users',
  },
  {
    module: 'users',
    action: 'read',
    code: 'users.read',
    description: 'Read users',
  },
  {
    module: 'users',
    action: 'update',
    code: 'users.update',
    description: 'Update users',
  },
];
