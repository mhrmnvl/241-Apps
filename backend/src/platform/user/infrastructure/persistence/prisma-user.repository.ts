import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { UserQueryInput } from '../../domain/interfaces/user-repository.interface.js';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { PUBLIC_USER_SELECT } from './prisma-user.includes.js';

@Injectable()
export class PrismaUserRepository extends IUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: UserQueryInput) {
    const { page = 1, limit = 10, roleCode, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(roleCode && {
        userRoles: {
          some: {
            role: {
              code: roleCode,
            },
          },
        },
      }),
      ...(search && {
        OR: [
          {
            identifier: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            profile: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    });
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    });
  }

  async findByIdentifierWithPassword(identifier: string) {
    return this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
    });
  }

  async existsByIdentifier(identifier: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
      select: { id: true },
    });
    return !!user;
  }

  async existsById(id: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    return !!user;
  }

  async create(data: { identifier: string; passwordHash: string }) {
    return this.prisma.user.create({
      data,
      select: PUBLIC_USER_SELECT,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_USER_SELECT,
    });
  }

  async remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: PUBLIC_USER_SELECT,
    });
  }
}
