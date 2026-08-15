import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║   Seed Custom Admin & Metadata   ║');
  console.log('╚══════════════════════════════════╝\n');

  // 1. Create or get the ADMIN role
  let adminRole = await prisma.role.findFirst({
    where: { code: 'ADMIN' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        code: 'ADMIN',
        name: 'Administrator',
        description: 'System Administrator',
        isSystem: true,
      },
    });
    console.log(`✓ Role ADMIN created (ID: ${adminRole.id})`);
  } else {
    console.log(`✓ Role ADMIN already exists (ID: ${adminRole.id})`);
  }

  // 2. Hash password 'admin'
  const hashed = await bcrypt.hash('admin', 10);

  // 3. Create or get the admin user
  let adminUser = await prisma.user.findFirst({
    where: { identifier: 'admin' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        identifier: 'admin',
        passwordHash: hashed,
        isActive: true,
      },
    });
    console.log(`✓ User 'admin' created (ID: ${adminUser.id})`);
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        passwordHash: hashed,
        isActive: true,
        deletedAt: null,
      },
    });
    console.log(`✓ User 'admin' updated (ID: ${adminUser.id})`);
  }

  // 4. Create or get a minimal profile
  let adminProfile = await prisma.profile.findFirst({
    where: { userId: adminUser.id },
  });

  if (!adminProfile) {
    const nik = '0000000000000001';
    const conflicting = await prisma.profile.findFirst({
      where: { OR: [{ nik }] },
    });

    if (!conflicting) {
      adminProfile = await prisma.profile.create({
        data: {
          userId: adminUser.id,
          name: 'Administrator',
          nik: nik,
          gender: 'MALE',
          birthPlace: 'Bandung',
          birthDate: new Date('1980-01-01'),
        },
      });
      console.log(
        `✓ Minimal Profile created for user 'admin' (ID: ${adminProfile.id})`,
      );
    } else {
      console.log(
        `⚠️ Profile with NIK ${nik} already exists, skipping profile creation`,
      );
    }
  } else {
    console.log(
      `✓ Profile already exists for user 'admin' (ID: ${adminProfile.id})`,
    );
  }

  // 5. Link admin user to ADMIN role
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log(`✓ Linked user 'admin' to ADMIN role.`);
  } else {
    console.log(`✓ User 'admin' is already linked to ADMIN role.`);
  }

  // 6. Seed Categories
  const categories = [
    { code: 'CAT-ELK', name: 'Elektronik', depreciationRatePercent: 12.5 },
    {
      code: 'CAT-MBL',
      name: 'Mebel / Furnitur',
      depreciationRatePercent: 10.0,
    },
    { code: 'CAT-KDR', name: 'Kendaraan', depreciationRatePercent: 20.0 },
    {
      code: 'CAT-ATK',
      name: 'Peralatan Kantor',
      depreciationRatePercent: 15.0,
    },
  ];
  for (const cat of categories) {
    await prisma.inventoryCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        depreciationRatePercent: cat.depreciationRatePercent,
      },
      create: cat,
    });
  }
  console.log('✓ Seeding Categories complete');

  // 7. Seed Locations
  const locations = [
    {
      code: 'LOC-GUR',
      name: 'Ruang Guru',
      building: 'Gedung A',
      room: 'Lantai 1',
    },
    {
      code: 'LOC-LAB',
      name: 'Laboratorium Komputer',
      building: 'Gedung B',
      room: 'Lantai 2',
    },
    {
      code: 'LOC-KLS7A',
      name: 'Kelas VII-A',
      building: 'Gedung C',
      room: 'Lantai 1',
    },
    {
      code: 'LOC-GUD',
      name: 'Gudang Utama',
      building: 'Gedung D',
      room: 'Lantai 1',
    },
  ];
  for (const loc of locations) {
    await prisma.inventoryLocation.upsert({
      where: { code: loc.code },
      update: { name: loc.name, building: loc.building, room: loc.room },
      create: loc,
    });
  }
  console.log('✓ Seeding Locations complete');

  // 8. Seed Conditions
  const conditions = [
    { code: 'COND-GOOD', name: 'Baik', isUsable: true },
    { code: 'COND-DMG-LGHT', name: 'Rusak Ringan', isUsable: true },
    { code: 'COND-DMG-HVY', name: 'Rusak Berat', isUsable: false },
  ];
  for (const cond of conditions) {
    await prisma.inventoryCondition.upsert({
      where: { code: cond.code },
      update: { name: cond.name, isUsable: cond.isUsable },
      create: cond,
    });
  }
  console.log('✓ Seeding Conditions complete');

  // 9. Seed Statuses
  const statuses = [
    { code: 'STAT-AVAIL', name: 'Tersedia', allowTransactions: true },
    { code: 'STAT-LOANED', name: 'Sedang Dipinjam', allowTransactions: false },
    { code: 'STAT-MAINT', name: 'Dalam Perawatan', allowTransactions: false },
    { code: 'STAT-LOST', name: 'Hilang', allowTransactions: false },
    {
      code: 'STAT-LOAN-PENDING',
      name: 'Menunggu Persetujuan',
      allowTransactions: false,
    },
    {
      code: 'STAT-LOAN-APPROVED',
      name: 'Peminjaman Disetujui',
      allowTransactions: false,
    },
    {
      code: 'STAT-LOAN-REJECTED',
      name: 'Peminjaman Ditolak',
      allowTransactions: false,
    },
    {
      code: 'STAT-LOAN-RETURNED',
      name: 'Selesai (Dikembalikan)',
      allowTransactions: false,
    },
  ];
  for (const stat of statuses) {
    await prisma.inventoryStatus.upsert({
      where: { code: stat.code },
      update: { name: stat.name, allowTransactions: stat.allowTransactions },
      create: stat,
    });
  }
  console.log('✓ Seeding Statuses complete');

  // 10. Seed Funding Sources
  const fundingSources = [
    { code: 'FUND-BOS', name: 'BOS (Bantuan Operasional Sekolah)' },
    { code: 'FUND-YAY', name: 'Yayasan' },
    { code: 'FUND-KOM', name: 'Komite Sekolah' },
  ];
  for (const fs of fundingSources) {
    await prisma.inventoryFundingSource.upsert({
      where: { code: fs.code },
      update: { name: fs.name },
      create: fs,
    });
  }
  console.log('✓ Seeding Funding Sources complete');

  // 11. Seed Transaction Types
  const transactionTypes = [
    {
      code: 'TX-LOAN-OUT',
      name: 'Pinjam Keluar',
      direction: 'OUT',
      description: 'Transaksi peminjaman aset keluar',
    },
    {
      code: 'TX-LOAN-IN',
      name: 'Kembali Masuk',
      direction: 'IN',
      description: 'Transaksi pengembalian aset masuk',
    },
  ];
  for (const tt of transactionTypes) {
    await prisma.inventoryTransactionType.upsert({
      where: { code: tt.code },
      update: {
        name: tt.name,
        direction: tt.direction,
        description: tt.description,
      },
      create: tt,
    });
  }
  console.log('✓ Seeding Transaction Types complete');

  // 12. Seed Default Workflow (2-Step: ADMIN then PRINCIPAL)
  const workflow = await prisma.approvalWorkflow.upsert({
    where: { name: 'Persetujuan Peminjaman Aset' },
    update: { isActive: true },
    create: {
      name: 'Persetujuan Peminjaman Aset',
      targetEntity: 'InventoryLoan',
      description:
        'Alur persetujuan peminjaman aset sekolah 2-tahap (Admin & Kepala Sekolah)',
      isActive: true,
    },
  });

  // The inventory administrator always signs. The head teacher signs when the
  // administrator asks for it — a borrowed projector does not need the same
  // signature as the school minibus, and `isMandatory: false` is what lets the
  // administrator decide that per request.
  const steps = [
    { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
    { stepSequence: 2, approverRoleCode: 'PRINCIPAL', isMandatory: false },
  ];
  for (const step of steps) {
    await prisma.approvalStep.upsert({
      where: {
        workflowId_stepSequence: {
          workflowId: workflow.id,
          stepSequence: step.stepSequence,
        },
      },
      update: {
        approverRoleCode: step.approverRoleCode,
        isMandatory: step.isMandatory,
      },
      create: {
        workflowId: workflow.id,
        stepSequence: step.stepSequence,
        approverRoleCode: step.approverRoleCode,
        isMandatory: step.isMandatory,
      },
    });
  }
  console.log('✓ Seeding Default Workflow complete');

  console.log('\n✓ Seeding finished successfully');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
