import { Injectable } from '@nestjs/common';
import { Prisma, SchoolUnitType } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  ISchoolUnitTypesRepository,
  SchoolUnitTypeQueryInput,
} from '../../domain/interfaces/school-unit-types-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaSchoolUnitTypesRepository extends ISchoolUnitTypesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: SchoolUnitTypeQueryInput,
  ): Promise<PaginatedResult<SchoolUnitType>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SchoolUnitTypeWhereInput = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.schoolUnitType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      this.prisma.schoolUnitType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SchoolUnitType | null> {
    return this.prisma.schoolUnitType.findUnique({
      where: { id },
    });
  }

  async findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SchoolUnitType | null> {
    return this.prisma.schoolUnitType.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(dto: Prisma.SchoolUnitTypeCreateInput): Promise<SchoolUnitType> {
    return this.prisma.schoolUnitType.create({
      data: dto,
    });
  }

  async update(
    id: string,
    dto: Prisma.SchoolUnitTypeUpdateInput,
  ): Promise<SchoolUnitType> {
    return this.prisma.schoolUnitType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<SchoolUnitType> {
    return this.prisma.schoolUnitType.delete({
      where: { id },
    });
  }

  async countSchoolUnitsWithType(id: string): Promise<number> {
    return this.prisma.schoolUnit.count({
      where: { typeId: id },
    });
  }
}
