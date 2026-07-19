import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  ISchoolUnitRepository,
  SchoolUnitWithDetails,
  SCHOOL_UNIT_INCLUDE,
} from '../../domain/interfaces/school-unit-repository.interface.js';

@Injectable()
export class PrismaSchoolUnitRepository extends ISchoolUnitRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFirst(): Promise<SchoolUnitWithDetails | null> {
    return this.prisma.schoolUnit.findFirst({
      where: { deletedAt: null, isActive: true },
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
    dto: Prisma.SchoolUnitCreateInput,
  ): Promise<SchoolUnitWithDetails> {
    const { typeId, ...rest } = dto as Prisma.SchoolUnitCreateInput & {
      typeId?: string | null;
    };
    return this.prisma.schoolUnit.create({
      data: {
        ...rest,
        type: typeId ? { connect: { id: typeId } } : undefined,
      },
      include: SCHOOL_UNIT_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: Prisma.SchoolUnitUpdateInput,
  ): Promise<SchoolUnitWithDetails> {
    const { typeId, ...rest } = dto as Prisma.SchoolUnitUpdateInput & {
      typeId?: string | null;
    };
    return this.prisma.schoolUnit.update({
      where: { id },
      data: {
        ...rest,
        type:
          typeId === null
            ? { disconnect: true }
            : typeId
              ? { connect: { id: typeId } }
              : undefined,
      },
      include: SCHOOL_UNIT_INCLUDE,
    });
  }
}
