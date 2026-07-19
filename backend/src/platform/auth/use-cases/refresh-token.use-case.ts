import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { TokenManagerService } from '../services/token-manager.service.js';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly tokenManagerService: TokenManagerService,
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(refreshTokenFromCookie: string) {
    let payload: { sessionId: string };
    try {
      payload = await this.tokenManagerService.verifyRefreshToken(
        refreshTokenFromCookie,
      );
    } catch (err: unknown) {
      this.logger.error('Verify token failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      throw new UnauthorizedException(`Invalid refresh token: ${msg}`);
    }

    const session = await this.authRepository.findSessionWithUser(
      payload.sessionId,
    );

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    if (!session.user.isActive || session.user.deletedAt) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const incomingHash = this.tokenManagerService.hashToken(
      refreshTokenFromCookie,
    );
    if (
      !this.tokenManagerService.constantTimeEqual(
        incomingHash,
        session.tokenHash,
      )
    ) {
      await this.authRepository.revokeSession(session.id);
      this.logger.warn(
        `Possible token reuse detected for session ${session.id}. Session revoked.`,
      );
      throw new UnauthorizedException('Token reuse detected. Session revoked.');
    }

    const { accessToken, refreshToken: rotatedRefreshToken } =
      await this.tokenManagerService.generateTokenPair(
        session.user,
        session.id,
      );

    const newRefreshHash =
      this.tokenManagerService.hashToken(rotatedRefreshToken);
    const refreshExpiresInMs =
      this.tokenManagerService.getRefreshExpirationMs();
    await this.authRepository.updateSessionToken(session.id, {
      tokenHash: newRefreshHash,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + refreshExpiresInMs),
    });

    this.logger.log(`Token rotated for user ${session.user.identifier}`);

    return {
      accessToken,
      refreshToken: rotatedRefreshToken,
      refreshExpiresInMs,
      user: {
        id: session.user.id,
        identifier: session.user.identifier,
        isActive: session.user.isActive,
      },
    };
  }
}
