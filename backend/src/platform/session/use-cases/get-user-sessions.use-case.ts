import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthSessionService } from '../../auth/index.js';
import { IUserRepository } from '../../user/index.js';

@Injectable()
export class GetUserSessionsUseCase {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly usersRepo: IUserRepository,
  ) {}

  async execute(userId: string) {
    const userExists = await this.usersRepo.existsById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.authSessionService.findUserSessions(userId);
  }
}
