import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type.js';
import { ValidateTokenUseCase } from '../use-cases/validate-token.use-case.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtTokenPayload) {
    try {
      return await this.validateTokenUseCase.execute(payload);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
