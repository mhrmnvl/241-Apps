import { SchoolUnitStatus } from '../../../../shared/domain/enums/school-unit-status.enum.js';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISchoolUnitRepository } from '../../domain/interfaces/school-unit-repository.interface.js';
import { SchoolUnitRepositoryInput } from '../../domain/interfaces/school-unit-repository.interface.js';
import {
  SCHOOL_UNIT_INCLUDE,
  SchoolUnitWithDetails,
} from './prisma-school-unit.includes.js';

@Injectable()
export class PrismaSchoolUnitRepository extends ISchoolUnitRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFirst(): Promise<SchoolUnitWithDetails | null> {
    return this.prisma.schoolUnit.findFirst({
      where: { deletedAt: null },
      include: SCHOOL_UNIT_INCLUDE,
    });
  }

  async findById(id: string): Promise<SchoolUnitWithDetails | null> {
    return this.prisma.schoolUnit.findUnique({
      where: { id, deletedAt: null },
      include: SCHOOL_UNIT_INCLUDE,
    });
  }

  async create(
    input: SchoolUnitRepositoryInput,
  ): Promise<SchoolUnitWithDetails> {
    const { typeId, ...rest } = input;
    return this.prisma.schoolUnit.create({
      data: {
        name: rest.name ?? '',
        surname: rest.surname ?? '',
        nsm: rest.nsm ?? '',
        npsn: rest.npsn ?? '',
        status: rest.status ?? SchoolUnitStatus.PRIVATE,
        npwp: rest.npwp ?? '',
        phone: rest.phone ?? '',
        email: rest.email ?? '',
        website: rest.website ?? '',
        latitude: rest.latitude ?? null,
        longitude: rest.longitude ?? null,
        type: typeId ? { connect: { id: typeId } } : undefined,
      },
      include: SCHOOL_UNIT_INCLUDE,
    });
  }

  async update(
    id: string,
    input: SchoolUnitRepositoryInput,
  ): Promise<SchoolUnitWithDetails> {
    const { typeId, ...rest } = input;
    const updateData: Prisma.SchoolUnitUpdateInput = {
      ...(rest.name && { name: rest.name }),
      ...(rest.surname && { surname: rest.surname }),
      ...(rest.nsm && { nsm: rest.nsm }),
      ...(rest.npsn && { npsn: rest.npsn }),
      ...(rest.status && { status: rest.status }),
      ...(rest.npwp && { npwp: rest.npwp }),
      ...(rest.phone && { phone: rest.phone }),
      ...(rest.email && { email: rest.email }),
      ...(rest.website && { website: rest.website }),
      ...(rest.isActive !== undefined && { isActive: rest.isActive }),
      // Compared against undefined, not truthiness: 0 is a real coordinate —
      // the equator and the prime meridian — and null is how a pin is cleared.
      ...(rest.latitude !== undefined && { latitude: rest.latitude }),
      ...(rest.longitude !== undefined && { longitude: rest.longitude }),
      type:
        typeId === null
          ? { disconnect: true }
          : typeId
            ? { connect: { id: typeId } }
            : undefined,
    };

    return this.prisma.schoolUnit.update({
      where: { id },
      data: updateData,
      include: SCHOOL_UNIT_INCLUDE,
    });
  }
}
