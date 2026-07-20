import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { PasswordManagerService } from '../services/password-manager.service.js';
import { ResetPasswordDto } from '../dto/request/reset-password.dto.js';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');
    const resetToken =
      await this.authRepository.findActivePasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new BadRequestException(
        'Tautan reset password tidak valid atau telah kadaluarsa',
      );
    }

    const hashedPassword = await this.passwordManagerService.hashPassword(
      dto.newPassword,
    );

    await this.authRepository.updateUserPassword(
      resetToken.userId,
      hashedPassword,
    );
    await this.authRepository.markPasswordResetTokenAsUsed(resetToken.id);

    // Revoke all sessions on reset password for security
    await this.authRepository.revokeAllOtherUserSessions(resetToken.userId, '');
  }
}
