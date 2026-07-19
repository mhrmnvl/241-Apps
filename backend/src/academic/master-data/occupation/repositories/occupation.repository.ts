import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateOccupationDto } from '../dto/create-occupation.dto.js';
import { UpdateOccupationDto } from '../dto/update-occupation.dto.js';
import { OccupationQueryDto } from '../dto/occupation-query.dto.js';
import {
  IOccupationRepository,
  OCCUPATION_INCLUDE,
} from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class OccupationRepository implements IOccupationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OccupationQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OccupationWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.occupation.findMany({
        where,
        include: OCCUPATION_INCLUDE,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.occupation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.occupation.findFirst({
      where: { id, deletedAt: null },
      include: OCCUPATION_INCLUDE,
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.occupation.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(dto: CreateOccupationDto) {
    return this.prisma.occupation.create({
      data: {
        name: dto.name,
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: OCCUPATION_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateOccupationDto) {
    return this.prisma.occupation.update({
      where: { id },
      data: dto,
      include: OCCUPATION_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.prisma.occupation.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async countActiveParents(occupationId: string) {
    return this.prisma.parent.count({
      where: { occupationId, deletedAt: null },
    });
  }
}
