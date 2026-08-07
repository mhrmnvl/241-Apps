import { PrismaClient } from '@prisma/client';
import { SYSTEM_PERMISSIONS } from '../../../src/platform/access-control/permission/constants/permission-codes.constants.js';

// The PORTAL row in app_settings is created by seedAppSettings, which iterates
// every AppKey — adding PORTAL to DEFAULT_APP_SETTINGS was enough. This seed
// covers what is portal-specific: the categories a post needs before it can be
// published (FR-012 makes a category mandatory to publish).
const DEFAULT_CATEGORIES = [
  { name: 'Prestasi', slug: 'prestasi', displayOrder: 1 },
  { name: 'Kegiatan', slug: 'kegiatan', displayOrder: 2 },
  { name: 'Akademik', slug: 'akademik', displayOrder: 3 },
  { name: 'Keagamaan', slug: 'keagamaan', displayOrder: 4 },
];

// Order and counts are admin-editable afterwards; these are only the starting
// values so a fresh install renders a sensible homepage (FR-028, FR-029).
const DEFAULT_HOMEPAGE_SECTIONS = [
  { key: 'berita', itemCount: 3, displayOrder: 1 },
  { key: 'agenda', itemCount: 3, displayOrder: 2 },
  { key: 'pengumuman', itemCount: 3, displayOrder: 3 },
  { key: 'galeri', itemCount: 3, displayOrder: 4 },
];

/**
 * Everything a humas account needs to run the portal, and nothing else.
 *
 * Every `portal-*` code, plus the two file permissions uploads go through
 * (`POST /files/upload?appKey=PORTAL` reuses the platform endpoint rather than
 * giving the portal a second, weaker validator).
 *
 * The list is derived from the catalogue rather than retyped, so a new portal
 * permission reaches this role by existing — a hand-maintained copy would drift
 * the first time someone adds a code and forgets the seed.
 *
 * Notably absent: anything academic, personnel, inventory, or admission. A
 * holder can publish the school's website and cannot read one student record
 * (FR-060, FR-061, verified by SC-005).
 */
const PORTAL_EDITOR_EXTRA_CODES = ['files.create', 'files.read'];

async function seedPortalEditorRole(prisma: PrismaClient) {
  const codes = [
    ...SYSTEM_PERMISSIONS.filter((perm) => perm.code.startsWith('portal-')).map(
      (perm) => perm.code,
    ),
    ...PORTAL_EDITOR_EXTRA_CODES,
  ];

  const role = await prisma.role.upsert({
    where: { code: 'PORTAL_EDITOR' },
    update: {
      name: 'Editor Portal',
      description: 'Mengelola konten portal sekolah',
    },
    create: {
      code: 'PORTAL_EDITOR',
      name: 'Editor Portal',
      description: 'Mengelola konten portal sekolah',
      isSystem: false,
    },
  });

  const permissions = await prisma.permission.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true },
  });

  // Replaced rather than merged: a permission removed from the list above must
  // actually leave the role, or a reseed can only ever widen it.
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map((perm) => ({
      roleId: role.id,
      permissionId: perm.id,
    })),
  });

  const missing = codes.filter(
    (code) => !permissions.some((perm) => perm.code === code),
  );
  if (missing.length > 0) {
    console.warn(
      `  [portal] WARNING: ${missing.length} permission(s) not in the catalogue: ${missing.join(', ')}`,
    );
  }

  console.log(
    `  [portal] PORTAL_EDITOR role seeded with ${permissions.length} permissions.`,
  );
}

export async function seedPortal(prisma: PrismaClient) {
  console.log('  [portal] Seeding post categories...');
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.postCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('  [portal] Seeding homepage sections...');
  for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
    await prisma.portalHomepageSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  await seedPortalEditorRole(prisma);

  console.log(
    `  [portal] ${await prisma.postCategory.count()} categories, ${await prisma.portalHomepageSection.count()} homepage sections`,
  );
}
