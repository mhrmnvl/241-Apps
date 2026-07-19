import { Injectable } from '@nestjs/common';
import { Occupation, Parent, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateParentDto } from '../../dto/create-parent.dto.js';
import { ParentQueryDto } from '../../dto/parent-query.dto.js';
import { UpdateParentDto } from '../../dto/update-parent.dto.js';
import {
  IParentRepository,
  PARENT_LIST_INCLUDE,
  PARENT_DETAIL_INCLUDE,
  ParentWithDetails,
  ParentListWithDetails,
} from '../../domain/interfaces/parent-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaParentRepository extends IParentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ParentQueryDto,
  ): Promise<PaginatedResult<ParentListWithDetails>> {
    const { page = 1, limit = 10, search, occupationId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ParentWhereInput = {
      deletedAt: null,
      ...(occupationId && { occupationId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nik: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.parent.findMany({
        where,
        include: PARENT_LIST_INCLUDE,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.parent.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ParentWithDetails | null> {
    return this.prisma.parent.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: PARENT_DETAIL_INCLUDE,
    });
  }

  async findByNik(nik: string, excludeId?: string): Promise<Parent | null> {
    return this.prisma.parent.findFirst({
      where: {
        nik,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findOccupationById(id: string): Promise<Occupation | null> {
    return this.prisma.occupation.findUnique({ where: { id } });
  }

  async create(dto: CreateParentDto): Promise<ParentWithDetails> {
    return this.prisma.parent.create({
      data: { ...dto, birthDate: new Date(dto.birthDate) },
      include: PARENT_DETAIL_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateParentDto): Promise<ParentWithDetails> {
    return this.prisma.parent.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
      },
      include: PARENT_DETAIL_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<Parent> {
    return this.prisma.parent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
