import { Prisma, Profile, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AccountProvisioningService } from '../../../../platform/user/index.js';
import type { ProfileUpdateInput } from '../../../../platform/profile/domain/entities/profile.entity.js';
import type {
  CreateStudentRepositoryInput,
  CreateStudentWithRelationsRepositoryInput,
  CreateStudentResult,
} from '../../domain/interfaces/student-repository.interface.js';
import {
  STUDENT_INCLUDE,
  StudentWithDetails,
} from './prisma-student.includes.js';

/**
 * Write paths that span more than one table inside a single transaction.
 *
 * They live beside the repository rather than inside it so the repository
 * stays a flat map of contract method → one persistence call.
 */

/** Provisions the account then creates the student row it points at. */
export async function createStudentInTx(
  tx: Prisma.TransactionClient,
  accountProvisioning: AccountProvisioningService,
  dto: CreateStudentRepositoryInput,
  passwordHash: string,
): Promise<CreateStudentResult> {
  const user = await accountProvisioning.provision(tx, {
    identifier: dto.identifier!,
    passwordHash,
    roleCode: 'STUDENT',
    profile: {
      name: dto.name,
      nik: dto.nik,
      gender: dto.gender,
      birthPlace: dto.birthPlace,
      birthDate: new Date(dto.birthDate),
      email: dto.email,
      phone: dto.phone,
    },
  });

  const student = await tx.student.create({
    data: {
      userId: user.id,
      nis: dto.nis ?? '',
      nisn: dto.nisn ?? '',
      status: StudentStatus.ACTIVE,
      ...(dto.gradeId && { gradeId: dto.gradeId }),
    },
    include: STUDENT_INCLUDE,
  });

  return { ...user, student };
}

/**
 * Updates the profile behind a student. The profile hangs off the user, so the
 * student row is resolved first; a missing student yields `null` rather than
 * throwing, letting the use-case raise its own domain exception.
 */
export async function updateStudentProfile(
  prisma: PrismaService,
  id: string,
  data: ProfileUpdateInput,
): Promise<Profile | null> {
  const student = await prisma.student.findFirst({
    where: { id, deletedAt: null },
    select: { userId: true },
  });
  if (!student) return null;

  return prisma.profile.update({
    where: { userId: student.userId },
    data,
  });
}

/**
 * Soft-deletes the student and deactivates the account it belongs to. Both
 * rows move together, hence the shared transaction.
 */
export async function softDeleteStudentInTx(
  tx: Prisma.TransactionClient,
  id: string,
): Promise<void> {
  const student = await tx.student.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { userId: true },
  });

  await tx.user.update({
    where: { id: student.userId },
    data: { isActive: false, deletedAt: new Date() },
  });
}

/** Same as above, plus the optional address and parent records from the wizard. */
export async function createStudentWithRelationsInTx(
  tx: Prisma.TransactionClient,
  accountProvisioning: AccountProvisioningService,
  dto: CreateStudentWithRelationsRepositoryInput,
  passwordHash: string,
): Promise<StudentWithDetails> {
  const user = await accountProvisioning.provision(tx, {
    identifier: dto.identifier!,
    passwordHash,
    roleCode: 'STUDENT',
    profile: {
      name: dto.name,
      nik: dto.nik,
      gender: dto.gender,
      birthPlace: dto.birthPlace,
      birthDate: new Date(dto.birthDate),
      email: dto.email,
      phone: dto.phone,
    },
  });

  const student = await tx.student.create({
    data: {
      userId: user.id,
      nis: dto.nis ?? '',
      nisn: dto.nisn ?? '',
      status: StudentStatus.ACTIVE,
      ...(dto.gradeId && { gradeId: dto.gradeId }),
    },
  });

  if (dto.address) {
    await tx.address.create({
      data: {
        studentId: student.id,
        street: dto.address.street,
        rt: dto.address.rt,
        rw: dto.address.rw,
        village: dto.address.village,
        district: dto.address.district,
        city: dto.address.city,
        province: dto.address.province,
        country: dto.address.country ?? 'Indonesia',
        postalCode: dto.address.postalCode,
        isPrimary: dto.address.isPrimary ?? true,
      },
    });
  }

  for (const parentInput of dto.parents ?? []) {
    const parent = await tx.parent.create({
      data: {
        name: parentInput.name,
        nik: parentInput.nik,
        birthPlace: parentInput.birthPlace,
        birthDate: new Date(parentInput.birthDate),
        email: parentInput.email,
        phone: parentInput.phone,
        occupationId: parentInput.occupationId,
        income: parentInput.income,
      },
    });
    await tx.studentParent.create({
      data: {
        studentId: student.id,
        parentId: parent.id,
        relation: parentInput.relation,
        isPrimary: parentInput.isPrimary ?? false,
      },
    });
  }

  return tx.student.findUniqueOrThrow({
    where: { id: student.id },
    include: STUDENT_INCLUDE,
  });
}
