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
    // Self-service. Holding this grants no sight of anyone else: the read
    // resolves the caller's own student record and answers about that. A class
    // recap stays on `attendances.read`, because a recap describes a cohort.
    module: 'attendances',
    action: 'read-own',
    code: 'attendances.read-own',
    description: 'Read your own attendance',
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

  // --- inventory ---
  //
  // Four areas, where there used to be one `inventory.*`. That single module
  // could not express the arrangement the school actually runs: the inventory
  // administrator keeps the register and signs the loans, while a teacher only
  // borrows. Under one code, granting a teacher enough to request a projector
  // also let them edit the asset register, delete a location, and read the
  // approval queue — the four are genuinely different jobs and now say so.

  // inventory-assets
  {
    module: 'inventory-assets',
    action: 'create',
    code: 'inventory-assets.create',
    description: 'Add assets and asset units to the register',
  },
  {
    module: 'inventory-assets',
    action: 'delete',
    code: 'inventory-assets.delete',
    description: 'Delete assets and asset units',
  },
  {
    module: 'inventory-assets',
    action: 'read',
    code: 'inventory-assets.read',
    description: 'Read the asset register',
  },
  {
    module: 'inventory-assets',
    action: 'update',
    code: 'inventory-assets.update',
    description: 'Update assets and asset units',
  },

  // inventory-loans
  {
    module: 'inventory-loans',
    action: 'create',
    code: 'inventory-loans.create',
    description: 'Request a loan — what a borrower needs, and all they need',
  },
  {
    module: 'inventory-loans',
    action: 'read',
    code: 'inventory-loans.read',
    description: 'Read loan transactions and the circulation history',
  },
  {
    module: 'inventory-loans',
    action: 'update',
    code: 'inventory-loans.update',
    description: 'Record the return of borrowed assets',
  },

  // inventory-approvals
  {
    module: 'inventory-approvals',
    action: 'create',
    code: 'inventory-approvals.create',
    description: 'Define who approves a loan, and in what order',
  },
  {
    module: 'inventory-approvals',
    action: 'read',
    code: 'inventory-approvals.read',
    description: 'Read the approval queue and the workflows behind it',
  },
  {
    module: 'inventory-approvals',
    action: 'update',
    code: 'inventory-approvals.update',
    description: 'Approve or reject a loan request',
  },

  // inventory-master-data
  {
    module: 'inventory-master-data',
    action: 'create',
    code: 'inventory-master-data.create',
    description: 'Create inventory categories, locations, conditions, statuses',
  },
  {
    module: 'inventory-master-data',
    action: 'delete',
    code: 'inventory-master-data.delete',
    description: 'Delete inventory reference data',
  },
  {
    module: 'inventory-master-data',
    action: 'read',
    code: 'inventory-master-data.read',
    description: 'Read inventory reference data',
  },
  {
    module: 'inventory-master-data',
    action: 'update',
    code: 'inventory-master-data.update',
    description: 'Update inventory reference data',
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

  // portal-agendas
  {
    module: 'portal-agendas',
    action: 'create',
    code: 'portal-agendas.create',
    description: 'Create portal agenda entries',
  },
  {
    module: 'portal-agendas',
    action: 'delete',
    code: 'portal-agendas.delete',
    description: 'Delete portal agenda entries',
  },
  {
    module: 'portal-agendas',
    action: 'publish',
    code: 'portal-agendas.publish',
    description: 'Publish or unpublish portal agenda entries',
  },
  {
    module: 'portal-agendas',
    action: 'read',
    code: 'portal-agendas.read',
    description: 'Read portal agenda entries',
  },
  {
    module: 'portal-agendas',
    action: 'update',
    code: 'portal-agendas.update',
    description: 'Update portal agenda entries',
  },

  // portal-albums
  {
    module: 'portal-albums',
    action: 'create',
    code: 'portal-albums.create',
    description: 'Create portal photo albums',
  },
  {
    module: 'portal-albums',
    action: 'delete',
    code: 'portal-albums.delete',
    description: 'Delete portal photo albums',
  },
  {
    module: 'portal-albums',
    action: 'publish',
    code: 'portal-albums.publish',
    description: 'Publish or unpublish portal photo albums',
  },
  {
    module: 'portal-albums',
    action: 'read',
    code: 'portal-albums.read',
    description: 'Read portal photo albums',
  },
  {
    module: 'portal-albums',
    action: 'update',
    code: 'portal-albums.update',
    description: 'Update portal photo albums',
  },

  // portal-categories
  {
    module: 'portal-categories',
    action: 'create',
    code: 'portal-categories.create',
    description: 'Create portal content categories',
  },
  {
    module: 'portal-categories',
    action: 'delete',
    code: 'portal-categories.delete',
    description: 'Delete portal content categories',
  },
  {
    module: 'portal-categories',
    action: 'read',
    code: 'portal-categories.read',
    description: 'Read portal content categories',
  },
  {
    module: 'portal-categories',
    action: 'update',
    code: 'portal-categories.update',
    description: 'Update portal content categories',
  },

  // portal-pages
  {
    module: 'portal-pages',
    action: 'create',
    code: 'portal-pages.create',
    description: 'Create portal informational pages',
  },
  {
    module: 'portal-pages',
    action: 'delete',
    code: 'portal-pages.delete',
    description: 'Delete portal informational pages',
  },
  {
    module: 'portal-pages',
    action: 'publish',
    code: 'portal-pages.publish',
    description: 'Publish or unpublish portal informational pages',
  },
  {
    module: 'portal-pages',
    action: 'read',
    code: 'portal-pages.read',
    description: 'Read portal informational pages',
  },
  {
    module: 'portal-pages',
    action: 'update',
    code: 'portal-pages.update',
    description: 'Update portal informational pages and public navigation',
  },

  // portal-posts
  {
    module: 'portal-posts',
    action: 'create',
    code: 'portal-posts.create',
    description: 'Create portal news, articles, and announcements',
  },
  {
    module: 'portal-posts',
    action: 'delete',
    code: 'portal-posts.delete',
    description: 'Delete and restore portal news, articles, and announcements',
  },
  {
    module: 'portal-posts',
    action: 'publish',
    code: 'portal-posts.publish',
    description:
      'Publish, unpublish, archive, and pin portal content — granted separately from create/update so writing and publishing can be different people',
  },
  {
    module: 'portal-posts',
    action: 'read',
    code: 'portal-posts.read',
    description: 'Read portal news, articles, and announcements',
  },
  {
    module: 'portal-posts',
    action: 'update',
    code: 'portal-posts.update',
    description: 'Update portal news, articles, and announcements',
  },

  // portal-settings
  {
    module: 'portal-settings',
    action: 'read',
    code: 'portal-settings.read',
    description: 'Read portal homepage section configuration',
  },
  {
    module: 'portal-settings',
    action: 'update',
    code: 'portal-settings.update',
    description: 'Update portal homepage section configuration',
  },

  // portal-tags
  {
    module: 'portal-tags',
    action: 'create',
    code: 'portal-tags.create',
    description: 'Create portal content tags',
  },
  {
    module: 'portal-tags',
    action: 'delete',
    code: 'portal-tags.delete',
    description: 'Delete portal content tags',
  },
  {
    module: 'portal-tags',
    action: 'read',
    code: 'portal-tags.read',
    description: 'Read portal content tags',
  },
  {
    module: 'portal-tags',
    action: 'update',
    code: 'portal-tags.update',
    description: 'Update portal content tags',
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
    // Self-service, and published only — a draft is a report card the school
    // has not yet stood behind.
    module: 'report-cards',
    action: 'read-own',
    code: 'report-cards.read-own',
    description: 'Read your own published report cards',
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
    // Self-service. What comes back depends on the caller's records, not on
    // what they say they are: a classroom timetable for a student, a teaching
    // schedule for a teacher, both for someone who is both.
    module: 'schedules',
    action: 'read-own',
    code: 'schedules.read-own',
    description: 'Read your own schedule',
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

  // settings
  {
    module: 'settings',
    action: 'update',
    code: 'settings.update',
    description: 'Update app settings',
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
      'Manage student scores for any class (bulk grade one assessment item)',
  },
  {
    // What a teacher does: grade the subjects they are assigned to teach, in
    // whichever classrooms they teach them, and correct marks in a classroom
    // they supervise as its homeroom teacher.
    //
    // One code rather than two, because `@RequirePermissions` requires *all*
    // the codes it names and cannot express "either". Two codes would mean two
    // routes, and the grading screen would have to choose between them by
    // guessing what the caller is — which is a role-name check wearing a
    // different hat, and the exact thing that once showed a teacher whose role
    // the school had named 'Wali Kelas' the administrator's screen.
    //
    // The reach comes from records — a teaching assignment, a supervisor row —
    // so a person who is neither reaches nothing, whatever their role is called.
    module: 'student-scores',
    action: 'manage-assigned',
    code: 'student-scores.manage-assigned',
    description:
      'Grade the classes you teach, and correct marks in the class you supervise',
  },
  {
    module: 'student-scores',
    action: 'read',
    code: 'student-scores.read',
    description: 'Read student scores',
  },
  {
    // Self-service. Includes assessments the caller has no mark for yet, so a
    // student can see what is still outstanding rather than an empty page.
    module: 'student-scores',
    action: 'read-own',
    code: 'student-scores.read-own',
    description: 'Read your own scores',
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
    // Self-service. `students.read` is a roster read — it answers with every
    // student — which is why a student must not hold it.
    module: 'students',
    action: 'read-own',
    code: 'students.read-own',
    description: 'Read your own student record',
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
    description: 'Read every teaching assignment in the school',
  },
  {
    // The picker on a teacher's grading screen. Without it the screen lists
    // every class in the school, the teacher chooses one they do not teach, and
    // the save is refused — a correct refusal that reads as a broken screen.
    module: 'teaching-assignments',
    action: 'read-own',
    code: 'teaching-assignments.read-own',
    description: 'Read the classes you are assigned to teach',
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

  // presence-credentials
  {
    module: 'presence-credentials',
    action: 'create',
    code: 'presence-credentials.create',
    description: 'Create presence credentials',
  },
  {
    module: 'presence-credentials',
    action: 'delete',
    code: 'presence-credentials.delete',
    description: 'Delete presence credentials',
  },
  {
    module: 'presence-credentials',
    action: 'read',
    code: 'presence-credentials.read',
    description: 'Read presence credentials',
  },
  {
    module: 'presence-credentials',
    action: 'update',
    code: 'presence-credentials.update',
    description: 'Update presence credentials',
  },

  // presence-devices
  {
    module: 'presence-devices',
    action: 'create',
    code: 'presence-devices.create',
    description: 'Create gate devices',
  },
  {
    module: 'presence-devices',
    action: 'delete',
    code: 'presence-devices.delete',
    description: 'Delete gate devices',
  },
  {
    module: 'presence-devices',
    action: 'read',
    code: 'presence-devices.read',
    description: 'Read gate devices',
  },
  {
    module: 'presence-devices',
    action: 'update',
    code: 'presence-devices.update',
    description: 'Update gate devices',
  },

  // presence-scans
  {
    module: 'presence-scans',
    action: 'read',
    code: 'presence-scans.read',
    description: 'Read the gate scan log, including rejected attempts',
  },

  // presence-records
  {
    module: 'presence-records',
    action: 'create',
    code: 'presence-records.create',
    description: 'Record a daily presence manually',
  },
  {
    module: 'presence-records',
    action: 'read',
    code: 'presence-records.read',
    description: 'Read the daily presence of any person',
  },
  {
    module: 'presence-records',
    action: 'read-own',
    code: 'presence-records.read-own',
    description: 'Read only your own daily presence',
  },
  {
    module: 'presence-records',
    action: 'update',
    code: 'presence-records.update',
    description: 'Correct a daily presence record',
  },

  // presence-periods
  {
    module: 'presence-periods',
    action: 'close',
    code: 'presence-periods.close',
    description: 'Close an attendance period, fixing its recap',
  },

  // work-patterns
  {
    module: 'work-patterns',
    action: 'create',
    code: 'work-patterns.create',
    description: 'Create work patterns',
  },
  {
    module: 'work-patterns',
    action: 'delete',
    code: 'work-patterns.delete',
    description: 'Delete work patterns',
  },
  {
    module: 'work-patterns',
    action: 'read',
    code: 'work-patterns.read',
    description: 'Read work patterns',
  },
  {
    module: 'work-patterns',
    action: 'update',
    code: 'work-patterns.update',
    description: 'Update work patterns',
  },

  // non-working-days
  {
    module: 'non-working-days',
    action: 'create',
    code: 'non-working-days.create',
    description: 'Create non-working days',
  },
  {
    module: 'non-working-days',
    action: 'delete',
    code: 'non-working-days.delete',
    description: 'Delete non-working days',
  },
  {
    module: 'non-working-days',
    action: 'read',
    code: 'non-working-days.read',
    description: 'Read non-working days',
  },
  {
    module: 'non-working-days',
    action: 'update',
    code: 'non-working-days.update',
    description: 'Update non-working days',
  },

  // leave-types
  {
    module: 'leave-types',
    action: 'create',
    code: 'leave-types.create',
    description: 'Create leave types',
  },
  {
    module: 'leave-types',
    action: 'delete',
    code: 'leave-types.delete',
    description: 'Delete leave types',
  },
  {
    module: 'leave-types',
    action: 'read',
    code: 'leave-types.read',
    description: 'Read leave types',
  },
  {
    module: 'leave-types',
    action: 'update',
    code: 'leave-types.update',
    description: 'Update leave types',
  },

  // leave-requests
  {
    module: 'leave-requests',
    action: 'approve',
    code: 'leave-requests.approve',
    description: 'Approve or reject a leave request',
  },
  {
    module: 'leave-requests',
    action: 'create',
    code: 'leave-requests.create',
    description: 'Submit a leave request',
  },
  {
    module: 'leave-requests',
    action: 'read',
    code: 'leave-requests.read',
    description: 'Read all leave requests',
  },
  {
    module: 'leave-requests',
    action: 'read-own',
    code: 'leave-requests.read-own',
    description: 'Read only your own leave requests',
  },

  // --- payroll: exempt from the ADMIN role bypass (ADR-0008) ---

  // payroll-components
  {
    module: 'payroll-components',
    action: 'create',
    code: 'payroll-components.create',
    description: 'Create salary components',
  },
  {
    module: 'payroll-components',
    action: 'delete',
    code: 'payroll-components.delete',
    description: 'Delete salary components',
  },
  {
    module: 'payroll-components',
    action: 'read',
    code: 'payroll-components.read',
    description: 'Read salary components',
  },
  {
    module: 'payroll-components',
    action: 'update',
    code: 'payroll-components.update',
    description: 'Update salary components',
  },

  // payroll-salaries
  {
    module: 'payroll-salaries',
    action: 'read',
    code: 'payroll-salaries.read',
    description: 'Read salary assignments',
  },
  {
    module: 'payroll-salaries',
    action: 'update',
    code: 'payroll-salaries.update',
    description: 'Set or change what an employee is paid',
  },

  // payroll-runs
  {
    module: 'payroll-runs',
    action: 'approve',
    code: 'payroll-runs.approve',
    description: 'Approve a payroll run, making it final',
  },
  {
    module: 'payroll-runs',
    action: 'create',
    code: 'payroll-runs.create',
    description: 'Create and calculate a payroll run',
  },
  {
    module: 'payroll-runs',
    action: 'read',
    code: 'payroll-runs.read',
    description: 'Read payroll runs',
  },
  {
    module: 'payroll-runs',
    action: 'update',
    code: 'payroll-runs.update',
    description: 'Recalculate or submit a draft payroll run',
  },

  // payroll-payslips
  {
    module: 'payroll-payslips',
    action: 'read',
    code: 'payroll-payslips.read',
    description: 'Read the payslip of any employee',
  },
  {
    module: 'payroll-payslips',
    action: 'read-own',
    code: 'payroll-payslips.read-own',
    description: 'Read only your own payslip',
  },
];
