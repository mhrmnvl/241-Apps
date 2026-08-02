import { Injectable } from '@nestjs/common';
import { Occupation, Parent, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  ParentQueryInput,
  CreateParentRepositoryInput,
  UpdateParentRepositoryInput,
} from '../../domain/interfaces/parent-repository.interface.js';
import type {
  ProfileEntity,
  ProfileUpdateInput,
} from '../../../../platform/profile/domain/entities/profile.entity.js';
import { IParentRepository } from '../../domain/interfaces/parent-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  PARENT_LIST_INCLUDE,
  PARENT_DETAIL_INCLUDE,
  ParentWithDetails,
  ParentListWithDetails,
} from './prisma-parent.includes.js';

@Injectable()
export class PrismaParentRepository extends IParentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ParentQueryInput,
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

  async findByUserId(userId: string): Promise<Parent | null> {
    return this.prisma.parent.findFirst({
      where: {
        deletedAt: null,
      },
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

  async create(dto: CreateParentRepositoryInput): Promise<ParentWithDetails> {
    return this.prisma.parent.create({
      data: dto,
      include: PARENT_DETAIL_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: UpdateParentRepositoryInput,
  ): Promise<ParentWithDetails> {
    return this.prisma.parent.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.birthDate && { birthDate: dto.birthDate }),
      },
      include: PARENT_DETAIL_INCLUDE,
    });
  }

  async updateProfile(
    userId: string,
    data: ProfileUpdateInput,
  ): Promise<ProfileEntity> {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async remove(id: string): Promise<Parent> {
    return this.softDelete(id);
  }

  async softDelete(id: string, userId?: string): Promise<Parent> {
    return this.prisma.parent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
