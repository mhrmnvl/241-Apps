import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateSocialMediaDto } from '../dto/request/create-social-media.dto.js';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class SocialMediaRepository implements ISocialMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip: number; take: number }) {
    const { skip, take } = params;

    const [data, total] = await Promise.all([
      this.prisma.socialMedia.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.socialMedia.count({ where: { deletedAt: null } }),
    ]);

    return { data, total };
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

  async create(dto: CreateSocialMediaDto) {
    return this.prisma.socialMedia.create({ data: dto });
  }

  async update(id: string, dto: UpdateSocialMediaDto) {
    return this.prisma.socialMedia.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.socialMedia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
