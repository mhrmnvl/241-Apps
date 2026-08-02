import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import {
  CreateSocialMediaRepositoryInput,
  SocialMediaQueryInput,
  UpdateSocialMediaRepositoryInput,
} from '../../domain/interfaces/social-media-repository.interface.js';
import { ISocialMediaRepository } from '../../domain/interfaces/social-media-repository.interface.js';

@Injectable()
export class PrismaSocialMediaRepository implements ISocialMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SocialMediaQueryInput) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SocialMediaWhereInput = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.socialMedia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.socialMedia.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.socialMedia.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.socialMedia.findFirst({
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

  async create(dto: CreateSocialMediaRepositoryInput) {
    return this.prisma.socialMedia.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateSocialMediaRepositoryInput) {
    return this.prisma.socialMedia.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.socialMedia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
