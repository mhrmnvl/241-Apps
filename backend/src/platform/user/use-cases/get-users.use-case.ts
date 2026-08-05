import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';
import { UserQueryDto } from '../dto/request/user-query.dto.js';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: UserQueryDto) {
    const { data, total, page, limit } = await this.userRepository.findAll({
      page: query.page,
      limit: query.limit,
      roleCode: query.roleCode,
      search: query.search,
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
