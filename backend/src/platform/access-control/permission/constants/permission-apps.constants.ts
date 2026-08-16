/**
 * Which application each permission module belongs to.
 *
 * The role screen needs this so an administrator can be given one application
 * rather than assembled out of sixty-odd modules by hand, and getting it wrong
 * is quiet: forgetting `enrollments` costs a button, while accidentally
 * including `roles` gives someone the power to create roles.
 *
 * It cannot be derived from the code's name. Four presence modules carry no
 * `presence-` prefix at all — `leave-requests`, `leave-types`, `work-patterns`,
 * `non-working-days` — so grouping by prefix would file them under academic
 * and hand an academic administrator the leave system. The mapping below was
 * read off the controllers that declare each code, not guessed from the string.
 *
 * `permission-apps.spec.ts` fails when a module in the catalogue is missing
 * here, which is what stops this drifting the next time a module is added.
 */
export type PermissionApp =
  | 'academic'
  | 'platform'
  | 'portal'
  | 'admission'
  | 'inventory'
  | 'presence'
  | 'payroll';

/**
 * Ordered as the role screen should show them: the school's own work first,
 * the system underneath it last.
 */
export const PERMISSION_APPS: { key: PermissionApp; label: string }[] = [
  { key: 'academic', label: 'Akademik' },
  { key: 'presence', label: 'Presensi' },
  { key: 'payroll', label: 'Penggajian' },
  { key: 'admission', label: 'PPDB' },
  { key: 'inventory', label: 'Inventaris' },
  { key: 'portal', label: 'Portal' },
  { key: 'platform', label: 'Sistem' },
];

const MODULE_APP: Record<string, PermissionApp> = {
  // academic
  'academic-calendar-types': 'academic',
  'academic-calendars': 'academic',
  'academic-years': 'academic',
  'assessment-items': 'academic',
  // Borrowed by presence's wali-kelas absence route, which changes an academic
  // attendance row — the permission names what is changed, not where the
  // request lands, so it stays academic.
  attendances: 'academic',
  classrooms: 'academic',
  curricula: 'academic',
  'curriculum-subjects': 'academic',
  enrollments: 'academic',
  graduations: 'academic',
  occupations: 'academic',
  parents: 'academic',
  positions: 'academic',
  'report-cards': 'academic',
  schedules: 'academic',
  semesters: 'academic',
  'student-scores': 'academic',
  students: 'academic',
  subjects: 'academic',
  teachers: 'academic',
  'teaching-assignments': 'academic',
  'time-slots': 'academic',

  // presence — the four without a prefix are the reason this file exists
  'leave-requests': 'presence',
  'leave-types': 'presence',
  'non-working-days': 'presence',
  'work-patterns': 'presence',
  'presence-credentials': 'presence',
  'presence-devices': 'presence',
  'presence-periods': 'presence',
  'presence-records': 'presence',
  'presence-scans': 'presence',

  // payroll
  'payroll-components': 'payroll',
  'payroll-payslips': 'payroll',
  'payroll-runs': 'payroll',
  'payroll-salaries': 'payroll',

  // admission
  'admission-announcements': 'admission',
  'admission-waves': 'admission',
  admissions: 'admission',

  // inventory
  'inventory-approvals': 'inventory',
  'inventory-assets': 'inventory',
  'inventory-loans': 'inventory',
  'inventory-master-data': 'inventory',

  // portal
  'portal-agendas': 'portal',
  'portal-albums': 'portal',
  'portal-categories': 'portal',
  'portal-pages': 'portal',
  'portal-posts': 'portal',
  'portal-settings': 'portal',
  'portal-tags': 'portal',

  // platform — cross-application, and the one group to hand out sparingly:
  // `roles`, `permissions`, `users` and `sessions` are the keys to the building
  'achievement-types': 'platform',
  achievements: 'platform',
  announcements: 'platform',
  'audit-logs': 'platform',
  'blood-types': 'platform',
  dashboards: 'platform',
  'educational-histories': 'platform',
  educations: 'platform',
  files: 'platform',
  permissions: 'platform',
  profiles: 'platform',
  religions: 'platform',
  roles: 'platform',
  scholarships: 'platform',
  'school-units': 'platform',
  sessions: 'platform',
  settings: 'platform',
  'social-media': 'platform',
  users: 'platform',
};

/**
 * Falls back to `platform` for a module nobody has classified.
 *
 * That is the cautious direction: an unclassified permission surfaces in the
 * group an operator hands out sparingly, rather than being swept into
 * "Akademik" where a per-application administrator would receive it without
 * anyone deciding to give it. The spec fails on the omission either way.
 */
export function appForModule(module: string): PermissionApp {
  return MODULE_APP[module] ?? 'platform';
}

export function isModuleClassified(module: string): boolean {
  return module in MODULE_APP;
}

/** Every module this file classifies, so a stale entry can be found. */
export function classifiedModules(): string[] {
  return Object.keys(MODULE_APP);
}
