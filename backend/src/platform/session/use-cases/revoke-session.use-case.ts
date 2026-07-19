import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthSessionService } from '../../auth/index.js';

@Injectable()
export class RevokeSessionUseCase {
  private readonly logger = new Logger(RevokeSessionUseCase.name);

  constructor(private readonly authSessionService: AuthSessionService) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.authSessionService.findById(sessionId);
    if (!session || session.revokedAt) {
      throw new NotFoundException(
        `Active session with ID ${sessionId} not found`,
      );
    }

    await this.authSessionService.revoke(sessionId);
    this.logger.log(`Session ${sessionId} manually revoked`);
  }
}
