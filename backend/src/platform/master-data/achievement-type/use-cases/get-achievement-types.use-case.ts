import { Injectable } from '@nestjs/common';
import { AchievementTypeQueryDto } from '../dto/request/achievement-type-query.dto.js';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class GetAchievementTypesUseCase {
  constructor(
    private readonly achievementTypeRepository: IAchievementTypeRepository,
  ) {}

  async execute(query: AchievementTypeQueryDto) {
    const { data, total, page, limit } =
      await this.achievementTypeRepository.findAll({
        page: query.page,
        limit: query.limit,
        search: query.search,
        isActive: query.isActive,
      });
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
