import { Injectable } from '@nestjs/common';
import { ProfileSocialMedia, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IProfileSocialMediaRepository } from '../../domain/interfaces/profile-social-media-repository.interface.js';
import {
  PROFILE_SOCIAL_MEDIA_INCLUDE,
  ProfileSocialMediaWithDetails,
} from './prisma-profile-social-media.includes.js';

@Injectable()
export class PrismaProfileSocialMediaRepository implements IProfileSocialMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProfileId(
    profileId: string,
  ): Promise<ProfileSocialMediaWithDetails[]> {
    return this.prisma.profileSocialMedia.findMany({
      where: { profileId, deletedAt: null },
      include: PROFILE_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async findByIdAndProfile(
    id: string,
    profileId: string,
  ): Promise<ProfileSocialMedia | null> {
    return this.prisma.profileSocialMedia.findFirst({
      where: { id, profileId, deletedAt: null },
    });
  }

  async findByPlatformAndProfile(
    socialMediaId: string,
    profileId: string,
  ): Promise<ProfileSocialMedia | null> {
    return this.prisma.profileSocialMedia.findFirst({
      where: { socialMediaId, profileId, deletedAt: null },
    });
  }

  async create(
    profileId: string,
    dto: { socialMediaId: string; username?: string | null },
  ): Promise<ProfileSocialMediaWithDetails> {
    return this.prisma.profileSocialMedia.create({
      data: {
        profileId,
        socialMediaId: dto.socialMediaId,
        username: dto.username,
      },
      include: PROFILE_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: Prisma.ProfileSocialMediaUpdateInput,
  ): Promise<ProfileSocialMediaWithDetails> {
    return this.prisma.profileSocialMedia.update({
      where: { id },
      data: dto,
      include: PROFILE_SOCIAL_MEDIA_INCLUDE,
    });
  }

  async remove(id: string): Promise<ProfileSocialMedia> {
    return this.prisma.profileSocialMedia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countByPlatformId(socialMediaId: string): Promise<number> {
    return this.prisma.profileSocialMedia.count({
      where: { socialMediaId, deletedAt: null },
    });
  }
}
