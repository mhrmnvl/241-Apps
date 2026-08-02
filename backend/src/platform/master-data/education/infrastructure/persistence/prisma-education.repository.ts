import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import {
  CreateEducationRepositoryInput,
  EducationQueryInput,
  UpdateEducationRepositoryInput,
} from '../../domain/interfaces/education-repository.interface.js';
import { IEducationRepository } from '../../domain/interfaces/education-repository.interface.js';

@Injectable()
export class PrismaEducationRepository implements IEducationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EducationQueryInput) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EducationWhereInput = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.education.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.education.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.education.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.education.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByCode(code: string, excludeId?: string) {
    return this.findByName(code, excludeId);
  }

  async create(dto: CreateEducationRepositoryInput) {
    return this.prisma.education.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateEducationRepositoryInput) {
    return this.prisma.education.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.education.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async softDelete(id: string) {
    return this.remove(id);
  }

  async countParentUsage(id: string) {
    return this.prisma.parent.count({
      where: { educationId: id, deletedAt: null },
    });
  }
}
