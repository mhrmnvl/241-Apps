import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type.js';

@Injectable()
export class ValidateTokenUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: JwtTokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
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

    return {
      id: session.user.id,
      sub: payload.sub,
      identifier: session.user.identifier,
      isActive: session.user.isActive,
      sessionId: session.id,
    };
  }
}
