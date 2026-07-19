import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';

const AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name);

  constructor(private readonly authRepository: IAuthRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const result = await this.authRepository.deleteExpiredSessions(
      now,
      AUDIT_RETENTION_MS,
    );

    this.logger.log(
      `Session cleanup completed: ${result.count} stale session(s) removed.`,
    );
  }
}
