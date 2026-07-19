import { Injectable } from '@nestjs/common';
import { SchoolUnitSocialMedia, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  ISchoolUnitSocialMediaRepository,
  SchoolUnitSocialMediaWithDetails,
  SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE,
} from '../../domain/interfaces/school-unit-social-media-repository.interface.js';

@Injectable()
export class PrismaSchoolUnitSocialMediaRepository extends ISchoolUnitSocialMediaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<SchoolUnitSocialMediaWithDetails[]> {
    return this.prisma.schoolUnitSocialMedia.findMany({
      where: { deletedAt: null },
      include: SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async findByPlatform(
    socialMediaId: string,
  ): Promise<SchoolUnitSocialMedia | null> {
    return this.prisma.schoolUnitSocialMedia.findFirst({
      where: { socialMediaId, deletedAt: null },
    });
  }

  async findById(id: string): Promise<SchoolUnitSocialMedia | null> {
    return this.prisma.schoolUnitSocialMedia.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(dto: {
    socialMediaId: string;
    username?: string | null;
  }): Promise<SchoolUnitSocialMediaWithDetails> {
    const schoolUnit = await this.prisma.schoolUnit.findFirst({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!schoolUnit) throw new Error('School unit not configured');
    return this.prisma.schoolUnitSocialMedia.create({
      data: {
        schoolUnitId: schoolUnit.id,
        socialMediaId: dto.socialMediaId,
        username: dto.username,
      },
      include: SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: Prisma.SchoolUnitSocialMediaUpdateInput,
  ): Promise<SchoolUnitSocialMediaWithDetails> {
    return this.prisma.schoolUnitSocialMedia.update({
      where: { id },
      data: dto,
      include: SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async remove(id: string): Promise<SchoolUnitSocialMedia> {
    return this.prisma.schoolUnitSocialMedia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countByPlatformId(socialMediaId: string): Promise<number> {
    return this.prisma.schoolUnitSocialMedia.count({
      where: { socialMediaId, deletedAt: null },
    });
  }
}
