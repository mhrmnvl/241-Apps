import { Injectable } from '@nestjs/common';
import { SocialMediaQueryDto } from '../dto/request/social-media-query.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class GetSocialMediasUseCase {
  constructor(private readonly repo: ISocialMediaRepository) {}

  async execute(query: SocialMediaQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const { data, total } = await this.repo.findAll({ skip, take: limit });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
