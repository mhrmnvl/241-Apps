import { Prisma } from '@prisma/client';
import { AccountProvisioningService } from '../../../../platform/user/index.js';
import type { CreateTeacherRepositoryInput } from '../../domain/interfaces/teacher-repository.interface.js';
import {
  TEACHER_DETAIL_INCLUDE,
  TeacherWithDetails,
} from './prisma-teacher.includes.js';

/**
 * Provisions the account, then creates the teacher row it points at — plus the
 * primary position when one was picked in the wizard. Both tables move inside
 * a single transaction, so the caller wraps this in `$transaction`.
 *
 * The login identifier falls back through NIP → NUPTK → NIK when the operator
 * leaves it blank.
 */
export async function createTeacherInTx(
  tx: Prisma.TransactionClient,
  accountProvisioning: AccountProvisioningService,
  dto: CreateTeacherRepositoryInput,
  hashedPassword: string,
): Promise<TeacherWithDetails> {
  const user = await accountProvisioning.provision(tx, {
    identifier: dto.identifier ?? dto.nip ?? dto.nuptk ?? dto.nik,
    passwordHash: hashedPassword,
    roleCode: 'TEACHER',
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

  return tx.teacher.create({
    data: {
      userId: user.id,
      nip: dto.nip,
      nuptk: dto.nuptk,
      employmentTypeId: dto.employmentTypeId,
      ...(dto.positionId
        ? {
            teacherPositions: {
              create: {
                positionId: dto.positionId,
                hireDate: new Date(),
                isPrimary: true,
              },
            },
          }
        : {}),
    },
    include: TEACHER_DETAIL_INCLUDE,
  });
}
