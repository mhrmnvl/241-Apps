import { Injectable } from '@nestjs/common';
import { SocialMediaQueryDto } from '../dto/request/social-media-query.dto.js';
import { ISocialMediaRepository } from '../domain/interfaces/social-media-repository.interface.js';

@Injectable()
export class GetSocialMediasUseCase {
  constructor(private readonly socialMediaRepository: ISocialMediaRepository) {}

  async execute(query: SocialMediaQueryDto) {
    const { page = 1, limit = 10 } = query;
    const { data, total } = await this.socialMediaRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
