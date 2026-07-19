import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthSessionService } from '../../auth/index.js';
import { IUserRepository } from '../../user/index.js';

@Injectable()
export class RevokeAllSessionsUseCase {
  private readonly logger = new Logger(RevokeAllSessionsUseCase.name);

  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly usersRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const userExists = await this.usersRepo.existsById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.authSessionService.revokeAll(userId);
    this.logger.log(`All sessions for user ${userId} revoked`);
  }
}
