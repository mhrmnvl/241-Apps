import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IProfileRepository } from '../../domain/interfaces/profile-repository.interface.js';
import { ProfileUpdateInput } from '../../domain/entities/profile.entity.js';
import {
  PROFILE_INCLUDE,
  ProfileWithDetails,
  UserDetail,
  ProfileWithSocialMedias,
  USER_IDENTITY_SELECT,
  TEACHER_DETAIL_INCLUDE,
  STUDENT_DETAIL_INCLUDE,
  PROFILE_WITH_SOCIAL_MEDIAS_INCLUDE,
} from './prisma-profile.includes.js';

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

  /**
   * Three reads instead of one six-level query.
   *
   * A user is a teacher or a student, never both, so the single query ran one
   * of the two heavy subtrees for nothing on every request. The identity read
   * carries a bare id for each; only the branch that exists is then fetched,
   * and the two are composed back into the same shape and key order the
   * caller had before.
   */
  async findDetailByUserId(userId: string): Promise<UserDetail | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_IDENTITY_SELECT,
    });

    if (!user) return null;

    const [teacher, student] = await Promise.all([
      user.teacher
        ? this.prisma.teacher.findUnique({
            where: { id: user.teacher.id },
            include: TEACHER_DETAIL_INCLUDE,
          })
        : null,
      user.student
        ? this.prisma.student.findUnique({
            where: { id: user.student.id },
            include: STUDENT_DETAIL_INCLUDE,
          })
        : null,
    ]);

    return { ...user, teacher, student };
  }

  async findByNik(nik: string, excludeUserId?: string) {
    return this.prisma.profile.findFirst({
      where: { nik, ...(excludeUserId && { NOT: { userId: excludeUserId } }) },
    });
  }

  async findByEmail(email: string, excludeUserId?: string) {
    return this.prisma.profile.findFirst({
      where: {
        email,
        ...(excludeUserId && { NOT: { userId: excludeUserId } }),
      },
    });
  }

  async findByPhone(phone: string, excludeUserId?: string) {
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
    dto: ProfileUpdateInput,
  ): Promise<ProfileWithDetails> {
    const { religionId, bloodTypeId, ...rest } = dto as ProfileUpdateInput & {
      religionId?: string | null;
      bloodTypeId?: string | null;
    };

    const updateData: Prisma.ProfileUpdateInput = {
      ...rest,
    };

    if (religionId !== undefined) {
      updateData.religion = religionId
        ? { connect: { id: religionId } }
        : { disconnect: true };
    }

    if (bloodTypeId !== undefined) {
      updateData.bloodType = bloodTypeId
        ? { connect: { id: bloodTypeId } }
        : { disconnect: true };
    }

    if (dto.birthDate) {
      updateData.birthDate = new Date(dto.birthDate);
    }

    return this.prisma.profile.update({
      where: { userId },
      data: updateData,
      include: PROFILE_INCLUDE,
    });
  }
}
