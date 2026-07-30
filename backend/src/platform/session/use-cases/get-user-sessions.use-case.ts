import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthSessionService } from '../../auth/index.js';
import { IUserRepository } from '../../user/index.js';

@Injectable()
export class GetUserSessionsUseCase {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const userExists = await this.userRepository.existsById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.authSessionService.findUserSessions(userId);
  }
}
