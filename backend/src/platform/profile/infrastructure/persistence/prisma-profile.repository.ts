import { Injectable } from '@nestjs/common';
import { Profile, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IProfileRepository,
  PROFILE_INCLUDE,
  ProfileWithDetails,
  UserDetail,
  ProfileWithSocialMedias,
  USER_DETAIL_SELECT,
  PROFILE_WITH_SOCIAL_MEDIAS_INCLUDE,
} from '../../domain/interfaces/profile-repository.interface.js';

@Injectable()
export class PrismaProfileRepository extends IProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: string): Promise<ProfileWithDetails | null> {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: PROFILE_INCLUDE,
    });
  }

  async findDetailByUserId(userId: string): Promise<UserDetail | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_DETAIL_SELECT,
    });
  }

  async findByNik(
    nik: string,
    excludeUserId?: string,
  ): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      where: { nik, ...(excludeUserId && { NOT: { userId: excludeUserId } }) },
    });
  }

  async findByEmail(
    email: string,
    excludeUserId?: string,
  ): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      where: {
        email,
        ...(excludeUserId && { NOT: { userId: excludeUserId } }),
      },
    });
  }

  async findByPhone(
    phone: string,
    excludeUserId?: string,
  ): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      where: {
        phone,
        ...(excludeUserId && { NOT: { userId: excludeUserId } }),
      },
    });
  }

  async findAllWithSocialMedias(params: {
    skip?: number;
    take?: number;
    search?: string;
    roleCode?: string;
  }): Promise<ProfileWithSocialMedias[]> {
    const { skip, take, search, roleCode } = params;

    const where: Prisma.ProfileWhereInput = {};

    if (roleCode) {
      where.user = {
        userRoles: {
          some: {
            role: {
              code: roleCode,
            },
          },
        },
      };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.profile.findMany({
      skip,
      take,
      where,
      include: PROFILE_WITH_SOCIAL_MEDIAS_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async countAllWithSocialMedias(params: {
    search?: string;
    roleCode?: string;
  }): Promise<number> {
    const { search, roleCode } = params;

    const where: Prisma.ProfileWhereInput = {};

    if (roleCode) {
      where.user = {
        userRoles: {
          some: {
            role: {
              code: roleCode,
            },
          },
        },
      };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.profile.count({ where });
  }

  async update(
    userId: string,
    dto: Prisma.ProfileUpdateInput,
  ): Promise<ProfileWithDetails> {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
        ...(dto.birthDate && {
          birthDate: new Date(dto.birthDate as string | Date),
        }),
      },
      include: PROFILE_INCLUDE,
    });
  }
}
