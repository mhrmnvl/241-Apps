import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import type {
  OccupationQueryInput,
  CreateOccupationRepositoryInput,
  UpdateOccupationRepositoryInput,
} from '../../domain/interfaces/occupation-repository.interface.js';
import { IOccupationRepository } from '../../domain/interfaces/occupation-repository.interface.js';
import { OCCUPATION_WITH_COUNT_INCLUDE } from './prisma-occupation.includes.js';

@Injectable()
export class PrismaOccupationRepository extends IOccupationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: OccupationQueryInput) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OccupationWhereInput = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.occupation.findMany({
        where,
        include: OCCUPATION_WITH_COUNT_INCLUDE,
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
      include: OCCUPATION_WITH_COUNT_INCLUDE,
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

  async create(dto: CreateOccupationRepositoryInput) {
    return this.prisma.occupation.create({
      data: {
        ...dto,
      },
    });
  }

  async update(id: string, dto: UpdateOccupationRepositoryInput) {
    return this.prisma.occupation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.occupation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countParentsWithOccupation(id: string) {
    return this.prisma.parent.count({
      where: { occupationId: id, deletedAt: null },
    });
  }

  async countActiveParents(id: string) {
    return this.countParentsWithOccupation(id);
  }
}
