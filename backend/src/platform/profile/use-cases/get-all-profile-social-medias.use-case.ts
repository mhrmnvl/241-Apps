import { Injectable } from '@nestjs/common';
import { ProfileSocialMediaQueryDto } from '../dto/request/profile-social-media-query.request.dto.js';
import {
  ProfileSocialMediaListDto,
  ProfileSocialMediaListResponseDto,
} from '../dto/response/profile-social-media.response.dto.js';
import { ProfileRepository } from '../index.js';

@Injectable()
export class GetAllProfileSocialMediasUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async execute(
    query: ProfileSocialMediaQueryDto,
  ): Promise<ProfileSocialMediaListResponseDto> {
    const { page = 1, limit = 10, search, roleCode } = query;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.profileRepo.findAllWithSocialMedias({
        skip,
        take: limit,
        search,
        roleCode,
      }),
      this.profileRepo.countAllWithSocialMedias({ search, roleCode }),
    ]);

    const data: ProfileSocialMediaListDto[] = profiles.flatMap((profile) =>
      profile.socialMedias.map((sm) => ({
        userId: profile.userId,
        profileId: profile.id,
        profileName: profile.name,
        profileRole: profile.user.userRoles[0]?.role.code,
        id: sm.id,
        socialMediaId: sm.socialMediaId,
        username: sm.username,
        platformName: sm.socialMedia.name,
        platformBaseUrl: sm.socialMedia.baseUrl,
      })),
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
