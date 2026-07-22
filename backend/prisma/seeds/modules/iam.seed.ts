import { Permission, PrismaClient, Role } from '@prisma/client';
import { SYSTEM_PERMISSIONS } from '../../../src/platform/access-control/permissions/constants/permission-codes.constants.js';

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
    {
      code: 'TEACHER',
      name: 'Teacher',
      description: 'Institution Teacher',
      isSystem: false,
    },
    {
      code: 'STUDENT',
      name: 'Student',
      description: 'Institution Student',
      isSystem: false,
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

  // ADMIN gets all permissions
  for (const perm of permissions) {
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // TEACHER permissions
  const teacherPermissionCodes = [
    'students.read',
    'parents.read',
    'attendances.read',
    'attendances.manage',
    'report-cards.read',
    'report-cards.publish',
    'assessment-items.read',
    'assessment-items.create',
    'assessment-items.update',
    'assessment-items.delete',
    'student-scores.read',
    'student-scores.manage',
  ];
  for (const perm of permissions) {
    if (teacherPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: teacherRole.id, permissionId: perm.id },
      });
    }
  }

  // STUDENT permissions
  const studentPermissionCodes = [
    'students.read',
    'attendances.read',
    'report-cards.read',
  ];
  for (const perm of permissions) {
    if (studentPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: studentRole.id, permissionId: perm.id },
      });
    }
  }

  // PARENT permissions
  const parentPermissionCodes = [
    'students.read',
    'attendances.read',
    'report-cards.read',
  ];
  for (const perm of permissions) {
    if (parentPermissionCodes.includes(perm.code)) {
      await prisma.rolePermission.create({
        data: { roleId: parentRole.id, permissionId: perm.id },
      });
    }
  }

  // PRINCIPAL permissions
  const principalPermissionCodes = [
    'inventory.read',
    'inventory.loans.read',
    'inventory.approvals.process',
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
