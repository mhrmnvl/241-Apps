import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { UserQueryDto } from '../dto/request/user-query.request.dto.js';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly usersRepository: IUserRepository) {}

  async execute(query: UserQueryDto) {
    const { data, total, page, limit } =
      await this.usersRepository.findAll(query);

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
