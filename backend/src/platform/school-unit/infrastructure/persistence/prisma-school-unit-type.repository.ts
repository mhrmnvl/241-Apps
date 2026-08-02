import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISchoolUnitTypeRepository } from '../../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class PrismaSchoolUnitTypeRepository implements ISchoolUnitTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schoolUnitType.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.schoolUnitType.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string, excludeId?: string) {
    return this.prisma.schoolUnitType.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(dto: { code: string; name: string }) {
    return this.prisma.schoolUnitType.create({
      data: dto,
    });
  }

  async update(id: string, dto: { code?: string; name?: string }) {
    return this.prisma.schoolUnitType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.schoolUnitType.delete({
      where: { id },
    });
  }

  async countSchoolUnitsWithType(id: string) {
    return this.prisma.schoolUnit.count({
      where: { typeId: id, deletedAt: null },
    });
  }
}
