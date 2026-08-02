import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISchoolUnitSocialMediaRepository } from '../../domain/interfaces/school-unit-social-media-repository.interface.js';
import { SchoolUnitSocialMediaEntity } from '../../domain/entities/school-unit-social-media.entity.js';

@Injectable()
export class PrismaSchoolUnitSocialMediaRepository extends ISchoolUnitSocialMediaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<SchoolUnitSocialMediaEntity[]> {
    return this.prisma.schoolUnitSocialMedia.findMany({
      where: { schoolUnitId, deletedAt: null },
    });
  }

  async findById(id: string): Promise<SchoolUnitSocialMediaEntity | null> {
    return this.prisma.schoolUnitSocialMedia.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(dto: {
    schoolUnitId: string;
    socialMediaId: string;
    username?: string | null;
  }): Promise<SchoolUnitSocialMediaEntity> {
    return this.prisma.schoolUnitSocialMedia.create({
      data: {
        schoolUnitId: dto.schoolUnitId,
        socialMediaId: dto.socialMediaId,
        username: dto.username,
      },
    });
  }

  async update(
    id: string,
    dto: { username?: string | null },
  ): Promise<SchoolUnitSocialMediaEntity> {
    return this.prisma.schoolUnitSocialMedia.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<SchoolUnitSocialMediaEntity> {
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
