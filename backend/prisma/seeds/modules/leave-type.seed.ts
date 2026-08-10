import { PrismaClient } from '@prisma/client';

/**
 * DINAS_LUAR is treatment OFFICIAL_DUTY rather than ON_LEAVE on purpose: the
 * person is working, just not at school, so it must not read as leave in a
 * recap or cost them an attendance-driven allowance.
 *
 * Only CUTI_TAHUNAN consumes a quota. Izin and sakit are counted but not
 * capped — capping sick days is a policy decision the school has not made, and
 * a seeded default is the wrong place to make it for them.
 */
const LEAVE_TYPES = [
  {
    code: 'IZIN',
    name: 'Izin',
    treatment: 'ON_LEAVE',
    consumesQuota: false,
    annualQuota: null,
    requiresDocument: false,
    appliesTo: 'EMPLOYEE',
  },
  {
    code: 'SAKIT',
    name: 'Sakit',
    treatment: 'ON_LEAVE',
    consumesQuota: false,
    annualQuota: null,
    requiresDocument: false,
    appliesTo: 'EMPLOYEE',
  },
  {
    code: 'CUTI_TAHUNAN',
    name: 'Cuti Tahunan',
    treatment: 'ON_LEAVE',
    consumesQuota: true,
    annualQuota: 12,
    requiresDocument: false,
    appliesTo: 'EMPLOYEE',
  },
  {
    code: 'DINAS_LUAR',
    name: 'Dinas Luar',
    treatment: 'OFFICIAL_DUTY',
    consumesQuota: false,
    annualQuota: null,
    requiresDocument: true,
    appliesTo: 'EMPLOYEE',
  },
  {
    code: 'SAKIT_SISWA',
    name: 'Sakit (Siswa)',
    treatment: 'ON_LEAVE',
    consumesQuota: false,
    annualQuota: null,
    requiresDocument: false,
    appliesTo: 'STUDENT',
  },
  {
    code: 'IZIN_SISWA',
    name: 'Izin (Siswa)',
    treatment: 'ON_LEAVE',
    consumesQuota: false,
    annualQuota: null,
    requiresDocument: false,
    appliesTo: 'STUDENT',
  },
] as const;

export async function seedLeaveTypes(prisma: PrismaClient) {
  let created = 0;

  for (const type of LEAVE_TYPES) {
    const existing = await prisma.leaveType.findUnique({
      where: { code: type.code },
    });
    if (existing) continue;

    await prisma.leaveType.create({ data: { ...type } });
    created++;
  }

  console.log(
    `  [leave-type] ${created} created, ${await prisma.leaveType.count()} total`,
  );
}
