import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateEmploymentTypeDto,
  UpdateEmploymentTypeDto,
} from '../dto/request/create-employment-type.dto.js';
import { EmploymentTypeQueryDto } from '../dto/request/employment-type-query.dto.js';
import { IEmploymentTypeRepository } from '../interfaces/employment-type-repository.interface.js';

@Injectable()
export class EmploymentTypeRepository implements IEmploymentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EmploymentTypeQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmploymentTypeWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.employmentType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      this.prisma.employmentType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.employmentType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string, excludeId?: string) {
    return this.prisma.employmentType.findFirst({
      where: {
        deletedAt: null,
        code: { equals: code, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(dto: CreateEmploymentTypeDto) {
    return this.prisma.employmentType.create({
      data: {
        ...dto,
      },
    });
  }

  async update(id: string, dto: UpdateEmploymentTypeDto) {
    return this.prisma.employmentType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.employmentType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countTeachersWithEmploymentType(id: string) {
    return this.prisma.teacher.count({
      where: { employmentTypeId: id, deletedAt: null },
    });
  }
}
