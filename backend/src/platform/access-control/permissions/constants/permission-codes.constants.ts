import { SystemPermission } from '../types/system-permission.type.js';

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  // Users
  {
    module: 'users',
    action: 'read',
    code: 'users.read',
    description: 'Read users',
  },
  {
    module: 'users',
    action: 'create',
    code: 'users.create',
    description: 'Create users',
  },
  {
    module: 'users',
    action: 'update',
    code: 'users.update',
    description: 'Update users',
  },
  {
    module: 'users',
    action: 'delete',
    code: 'users.delete',
    description: 'Delete users',
  },

  // Roles
  {
    module: 'roles',
    action: 'read',
    code: 'roles.read',
    description: 'Read roles',
  },
  {
    module: 'roles',
    action: 'create',
    code: 'roles.create',
    description: 'Create roles',
  },
  {
    module: 'roles',
    action: 'update',
    code: 'roles.update',
    description: 'Update roles',
  },
  {
    module: 'roles',
    action: 'delete',
    code: 'roles.delete',
    description: 'Delete roles',
  },
  {
    module: 'roles',
    action: 'assign',
    code: 'roles.assign',
    description: 'Assign roles to users',
  },

  // Permissions
  {
    module: 'permissions',
    action: 'read',
    code: 'permissions.read',
    description: 'Read permissions',
  },
  {
    module: 'permissions',
    action: 'manage',
    code: 'permissions.manage',
    description: 'Manage role permissions',
  },

  // Students
  {
    module: 'students',
    action: 'read',
    code: 'students.read',
    description: 'Read student profiles',
  },
  {
    module: 'students',
    action: 'create',
    code: 'students.create',
    description: 'Create student profiles',
  },
  {
    module: 'students',
    action: 'update',
    code: 'students.update',
    description: 'Update student profiles',
  },
  {
    module: 'students',
    action: 'delete',
    code: 'students.delete',
    description: 'Delete student profiles',
  },

  // Parents
  {
    module: 'parents',
    action: 'read',
    code: 'parents.read',
    description: 'Read parent profiles',
  },
  {
    module: 'parents',
    action: 'create',
    code: 'parents.create',
    description: 'Create parent profiles',
  },
  {
    module: 'parents',
    action: 'update',
    code: 'parents.update',
    description: 'Update parent profiles',
  },
  {
    module: 'parents',
    action: 'delete',
    code: 'parents.delete',
    description: 'Delete parent profiles',
  },

  // Attendances
  {
    module: 'attendances',
    action: 'read',
    code: 'attendances.read',
    description: 'Read attendances',
  },
  {
    module: 'attendances',
    action: 'manage',
    code: 'attendances.manage',
    description: 'Manage attendances',
  },

  // Report Cards
  {
    module: 'report-cards',
    action: 'read',
    code: 'report-cards.read',
    description: 'Read report cards',
  },
  {
    module: 'report-cards',
    action: 'publish',
    code: 'report-cards.publish',
    description: 'Publish report cards',
  },

  // Admissions
  {
    module: 'admissions',
    action: 'read',
    code: 'admissions.read',
    description: 'Read admission applications',
  },
  {
    module: 'admissions',
    action: 'verify',
    code: 'admissions.verify',
    description: 'Verify admission documents, payments, and applications',
  },
  {
    module: 'admissions',
    action: 'decide',
    code: 'admissions.decide',
    description: 'Accept or reject admission applications',
  },
  {
    module: 'admissions',
    action: 'enroll',
    code: 'admissions.enroll',
    description: 'Enroll accepted applicants as students',
  },

  // Admission Waves
  {
    module: 'admission-waves',
    action: 'read',
    code: 'admission-waves.read',
    description: 'Read admission waves',
  },
  {
    module: 'admission-waves',
    action: 'create',
    code: 'admission-waves.create',
    description: 'Create admission waves',
  },
  {
    module: 'admission-waves',
    action: 'update',
    code: 'admission-waves.update',
    description: 'Update admission waves',
  },
  {
    module: 'admission-waves',
    action: 'delete',
    code: 'admission-waves.delete',
    description: 'Delete admission waves',
  },

  // Admission Announcements
  {
    module: 'admission-announcements',
    action: 'read',
    code: 'admission-announcements.read',
    description: 'Read admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'create',
    code: 'admission-announcements.create',
    description: 'Create admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'update',
    code: 'admission-announcements.update',
    description: 'Update admission announcements',
  },
  {
    module: 'admission-announcements',
    action: 'delete',
    code: 'admission-announcements.delete',
    description: 'Delete admission announcements',
  },
];
