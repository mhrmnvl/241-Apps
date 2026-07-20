import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { PasswordManagerService } from '../services/password-manager.service.js';
import { ChangePasswordDto } from '../dto/request/change-password.dto.js';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async execute(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const isCurrentValid = await this.passwordManagerService.validatePassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Password saat ini salah');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Password baru tidak boleh sama dengan password saat ini',
      );
    }

    const newPasswordHash = await this.passwordManagerService.hashPassword(
      dto.newPassword,
    );

    await this.authRepository.updateUserPassword(userId, newPasswordHash);
    await this.authRepository.revokeAllOtherUserSessions(
      userId,
      currentSessionId,
    );
  }
}
