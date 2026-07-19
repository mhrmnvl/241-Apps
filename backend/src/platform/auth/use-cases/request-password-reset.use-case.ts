import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { EmailService } from '../../notification/email.service.js';

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    identifier: string,
  ): Promise<{ success: boolean; message: string; debugToken?: string }> {
    const user = await this.authRepository.findUserByIdentifier(identifier);

    // Security best practice: prevent user enumeration by always returning success
    if (!user || !user.isActive || user.deletedAt) {
      this.logger.warn(
        `Password reset requested for non-existent or inactive user: ${identifier}`,
      );
      return {
        success: true,
        message:
          'Jika akun Anda terdaftar, email instruksi reset password telah dikirim.',
      };
    }

    // Generate secure token (32 bytes = 64 chars hex string)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    await this.authRepository.createPasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const subject = 'Reset Password Akun SIAKAD';
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Permintaan Reset Password</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          Kami menerima permintaan untuk mereset password akun SIAKAD Anda. Klik tombol di bawah ini untuk mengganti password Anda:
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          Tautan ini hanya berlaku selama 15 menit. Jika Anda tidak merasa mengajukan permintaan ini, abaikan email ini.
        </p>
      </div>
    `;

    const emailSent = await this.emailService.sendEmail(
      user.identifier,
      subject,
      htmlContent,
    );

    const result: { success: boolean; message: string; debugToken?: string } = {
      success: true,
      message:
        'Jika akun Anda terdaftar, email instruksi reset password telah dikirim.',
    };

    const isNotProduction =
      this.configService.get<string>('NODE_ENV') !== 'production';
    if (!emailSent) {
      this.logger.log(`[DEVELOPMENT ONLY] Reset Password link: ${resetUrl}`);
      result.debugToken = token;
    } else if (isNotProduction) {
      this.logger.log(`[DEVELOPMENT ONLY] Reset Password link: ${resetUrl}`);
      result.debugToken = token;
    }

    return result;
  }
}
