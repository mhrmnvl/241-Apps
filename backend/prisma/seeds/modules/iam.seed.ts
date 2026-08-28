import { Permission, PrismaClient, Role } from '@prisma/client';
import { SYSTEM_PERMISSIONS } from '../../../src/platform/access-control/permission/constants/permission-codes.constants.js';

/**
 * Must match ROLE_BYPASS_EXEMPT_PREFIXES in permission.guard.ts
 * (ADR-0006 for `portal-`, ADR-0008 for `payroll-`).
 */
const ROLE_BYPASS_EXEMPT_PREFIXES = ['portal-', 'payroll-'] as const;

function isBypassExempt(code: string): boolean {
  return ROLE_BYPASS_EXEMPT_PREFIXES.some((prefix) => code.startsWith(prefix));
}

export async function seedIam(prisma: PrismaClient) {
  console.log('  [iam] seeding roles and permissions...');

  // 1. Seed Permissions
  const permissions: Permission[] = [];
  for (const perm of SYSTEM_PERMISSIONS) {
    const dbPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
      create: perm,
    });
    permissions.push(dbPerm);
  }
  console.log(`  [iam] seeded ${permissions.length} permissions.`);

  // 2. Seed Default Roles
  const rolesMap = new Map<string, Role>();

  const roleDefs = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Platform Super Admin',
      isSystem: true,
    },
    {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Institution Administrator',
      isSystem: true,
    },
    // System, because the code resolves these two by this exact code and
    // cannot proceed without them: creating a teacher looks up 'TEACHER',
    // creating a student — or enrolling an accepted applicant — looks up
    // 'STUDENT'. `isSystem` is the only thing standing between that and a
    // delete, so `false` here is a promise the code cannot keep.
    {
      code: 'TEACHER',
      name: 'Teacher',
      description: 'Institution Teacher',
      isSystem: true,
    },
    {
      code: 'STUDENT',
      name: 'Student',
      description: 'Institution Student',
      isSystem: true,
    },
    {
      code: 'PARENT',
      name: 'Parent',
      description: 'Student Parent',
      isSystem: false,
    },
    {
      code: 'PRINCIPAL',
      name: 'Kepala Sekolah',
      description: 'School Headmaster',
      isSystem: false,
    },
    {
      code: 'APPLICANT',
      name: 'Pendaftar',
      description: 'Admission Applicant',
      isSystem: true,
    },
  ];

  for (const r of roleDefs) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
      },
    });
    rolesMap.set(r.code, role);
  }
  console.log('  [iam] seeded default roles.');

  // 3. Link permissions to roles
  const superAdminRole = rolesMap.get('SUPER_ADMIN')!;
  const adminRole = rolesMap.get('ADMIN')!;
  const teacherRole = rolesMap.get('TEACHER')!;
  const studentRole = rolesMap.get('STUDENT')!;
  const parentRole = rolesMap.get('PARENT')!;
  const principalRole = rolesMap.get('PRINCIPAL')!;

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: {
        in: [
          superAdminRole.id,
          adminRole.id,
          teacherRole.id,
          studentRole.id,
          parentRole.id,
          principalRole.id,
        ],
      },
    },
  });

  // SUPER_ADMIN gets all permissions
  for (const perm of permissions) {
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // ADMIN gets every permission EXCEPT the portal's and payroll's.
  //
  // The guard exemptions (ADR-0006, ADR-0008) stop ADMIN's blanket role bypass
  // at `portal-*` and `payroll-*`, but a bypass that is removed and then handed
  // back as an explicit grant is no boundary at all — FR-062 and FR-051 would
  // fail on a seeded install while passing every guard test. The two have to
  // agree.
  //
  // SUPER_ADMIN above keeps everything, and the seeded admin user holds both
  // roles, so a fresh install still has a way into both.
  for (const perm of permissions) {
    if (isBypassExempt(perm.code)) continue;
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // TEACHER permissions
  //
  // Teaching and marking, and the reference lists those screens read to fill
  // their own pickers. Nothing else: this role had grown to 182 codes on the
  // development box — four more than ADMIN — including `users.delete`,
  // `roles.create`, `permissions.manage` and `teachers.delete`. Every
  // management screen in the app was on a teacher's sidebar, and a teacher
  // could remove a colleague.
  //
  // One code is deliberately absent that used to be here:
  // `student-scores.manage` grades any class in the school.
  // `manage-assigned` reaches the subjects they are assigned to teach and the
  // classroom they supervise, resolved from those records rather than from
  // what their role is called.
  //
  // Reading is wider than writing on purpose. A teacher may look up any
  // student or colleague — knowing who is in the school is part of the job —
  // but holds no `.create`, `.update` or `.delete` on either, so both screens
  // open as lists and nothing more. What stays out of reach is account
  // administration: Akun Siswa and Akun Guru are gated on `users.read`, which
  // is about logins rather than people.
  //
  // The reference reads at the end unlock no menu of their own. The sections
  // holding Daftar Kelas, Semester, Mata Pelajaran, Agama and Tingkat
  // Pendidikan are gated on `academic-years.read` and `occupations.read`,
  // which this role does not hold, and a section whose gate fails is dropped
  // whole.
  const teacherPermissionCodes = [
    // Their own dashboard: today's lessons, the classes they hold, and the
    // marking still outstanding. Not `dashboards.read`, which is the school's
    // totals and belongs to whoever runs the school rather than to every teacher.
    'dashboards.read-own',

    // What they teach, and when.
    'teaching-assignments.read-own',
    'schedules.read-own',

    // The register for their own lessons, and the recap behind it.
    'attendances.read',
    'attendances.manage',

    // The tasks they set.
    'assessment-items.read',
    'assessment-items.create',
    'assessment-items.update',
    'assessment-items.delete',

    // The marks they give for them.
    'student-scores.read',
    'student-scores.create',
    'student-scores.update',
    'student-scores.manage-assigned',

    // The rapor those marks add up to.
    'report-cards.read',
    'report-cards.create',
    'report-cards.publish',

    // What the school tells everyone, and when it happens. Writing either is
    // a `.create`, which this role does not hold, so both open read-only.
    'announcements.read',
    'academic-calendars.read',

    // Who is in the school. Read-only: no create, update or delete on either,
    // so these are lists to look someone up in, not registers to keep.
    'students.read',
    'teachers.read',

    // Reference data their own screens read to fill a class or subject picker.
    //
    // `academic-years.read` is here because Daftar Kelas shows which year a
    // class belongs to and filters by it — without it that screen opened on a
    // refusal. Editing the years is `academic-years.update`, which this role
    // does not hold, and which is what the menu entry and the route now ask
    // for.
    'academic-years.read',
    'classrooms.read',
    'subjects.read',
    'semesters.read',
    'enrollments.read',
    // The bell times. Every timetable is drawn against them, their own
    // included, so without this a teacher's schedule came up with no rows.
    'time-slots.read',

    // The lists their own profile page reads to render itself — religion,
    // blood group, level of education, kind of employment, kind of
    // achievement. Without these the page came up with five denials on it.
    'religions.read',
    'blood-types.read',
    'educations.read',
    'achievement-types.read',
  ];
  for (const perm of permissions) {
    if (teacherPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: teacherRole.id, permissionId: perm.id },
      });
    }
  }

  // STUDENT permissions
  //
  // Self-service only. This role used to hold `students.read`,
  // `attendances.read` and `report-cards.read` — the same codes the management
  // screens require, over reads that did not look at who was asking. A student
  // opening their own menu was served every student's report card and the
  // school's whole attendance recap.
  //
  // The `-own` codes reach endpoints that resolve the caller's student record
  // and answer about that. `students.read` in particular is a roster read: it
  // returns every student, and its sibling `students.read-own` does not.
  const studentPermissionCodes = [
    'dashboards.read-own',
    'students.read-own',
    'attendances.read-own',
    'report-cards.read-own',
    'student-scores.read-own',
    'schedules.read-own',

    // The school as a student may look at it: the announcements, the calendar,
    // which classes exist and which subjects are taught. All read-only, and
    // none of it names another student.
    //
    // The first two were already on the student's menu and had never worked:
    // the entries carried no permission, so they showed, and the router asked
    // for these two codes and threw them back to the dashboard. The two
    // screens a student was most likely to open were the two that bounced.
    // The noticeboard as it is addressed to them: school-wide notices plus
    // their own class's. Not `announcements.read`, which is every notice the
    // school has posted — a first-year would have read "Persiapan Ujian Akhir
    // Kelas IX" under that one.
    'announcements.read-own',
    'academic-calendars.read',
    'subjects.read',

    // Their own classroom, and only that one.
    //
    // Not `classrooms.read`, which is the register of every class the school
    // runs — a student was given it so that Daftar Kelas would open, and it
    // opened onto all of them. `classrooms.read-own` reaches
    // `GET /students/me/classroom`, which resolves the caller's enrolment and
    // answers about that room alone: who runs it, who teaches it, who else is
    // in it. There is no id to pass, so there is nothing to widen.
    'classrooms.read-own',

    // The bell times their own timetable is drawn against.
    'time-slots.read',
  ];
  for (const perm of permissions) {
    if (studentPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: studentRole.id, permissionId: perm.id },
      });
    }
  }

  // PARENT permissions
  //
  // Deliberately empty. This role held the same three wide codes the student
  // role did, and the same reads answered them the same way — so a guardian
  // account could read every student's report card.
  //
  // It is not moved onto the `-own` codes, because a parent's "own" is their
  // child's record, and which guardian may see which child is a question this
  // system has not answered. Granting nothing is the honest state until it
  // does: there is no parent surface today, so nothing is lost, and the
  // alternative would be leaving the hole open for one role while closing it
  // for another.
  const parentPermissionCodes: string[] = [];
  for (const perm of permissions) {
    if (parentPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: parentRole.id, permissionId: perm.id },
      });
    }
  }

  // PRINCIPAL permissions
  //
  // The head teacher is the optional second approver on a loan: the inventory
  // administrator decides, per request, whether it also needs this signature.
  // So the grant is the approval queue plus enough of the loan and the asset to
  // judge it — not the register itself, which is the administrator's to keep.
  //
  // Two of the three codes here were `inventory.loans.read` and
  // `inventory.approvals.process`, neither of which has ever existed. The loop
  // below matches against real permissions, so they granted nothing and said
  // nothing about it; the head teacher had `inventory.read` alone and could not
  // approve anything.
  const principalPermissionCodes = [
    'inventory-approvals.read',
    'inventory-approvals.update',
    'inventory-loans.read',
    'inventory-assets.read',
  ];
  for (const perm of permissions) {
    if (principalPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: principalRole.id, permissionId: perm.id },
      });
    }
  }

  console.log('  [iam] role permissions mapped.');

  // 4. Assign ADMIN and SUPER_ADMIN roles to the admin user
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
  const adminUser = await prisma.user.findFirst({
    where: { identifier: adminUsername, deletedAt: null },
  });

  if (adminUser) {
    await prisma.userRole.deleteMany({
      where: { userId: adminUser.id },
    });

    await prisma.userRole.createMany({
      data: [
        { userId: adminUser.id, roleId: superAdminRole.id },
        { userId: adminUser.id, roleId: adminRole.id },
      ],
    });
    console.log(
      `  [iam] admin user '${adminUsername}' linked to SUPER_ADMIN and ADMIN roles.`,
    );
  }
}
