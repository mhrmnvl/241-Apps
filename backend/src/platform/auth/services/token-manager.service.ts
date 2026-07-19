import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as crypto from 'node:crypto';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type.js';

export type { JwtTokenPayload };

@Injectable()
export class TokenManagerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokenPair(
    user: {
      id: string;
      identifier: string;
    },
    sessionId: string,
  ) {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const accessExp = this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
      '15m',
    );
    const refreshExp = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );

    const accessPayload: JwtTokenPayload = {
      sub: user.id,
      sessionId,
      identifier: user.identifier,
      type: 'access',
    };

    const refreshPayload: JwtTokenPayload = {
      sub: user.id,
      sessionId,
      identifier: user.identifier,
      type: 'refresh',
    };

    const accessExpiresIn: StringValue = accessExp as StringValue;
    const refreshExpiresIn: StringValue = refreshExp as StringValue;

    return {
      accessToken: await this.jwtService.signAsync(accessPayload, {
        secret,
        expiresIn: accessExpiresIn,
      }),
      refreshToken: await this.jwtService.signAsync(refreshPayload, {
        secret,
        expiresIn: refreshExpiresIn,
      }),
    };
  }

  async verifyRefreshToken(token: string): Promise<JwtTokenPayload> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const cleanToken = this.sanitizeJwtToken(token);

    const payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
      cleanToken,
      { secret },
    );

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  async verifyAccessToken(token: string): Promise<JwtTokenPayload> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const cleanToken = this.sanitizeJwtToken(token);

    const payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
      cleanToken,
      { secret },
    );

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  constantTimeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  }

  getRefreshExpirationMs(): number {
    const refreshExp = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );

    const match = /^(\d+)([smhd])$/.exec(refreshExp);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || 1000);
  }

  private sanitizeJwtToken(token: string): string {
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    return decodeURIComponent(cleanToken).trim();
  }
}
