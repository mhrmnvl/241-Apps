import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthController } from './presentation/auth.controller.js';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository.js';
import { IAuthRepository } from './domain/interfaces/auth-repository.interface.js';
import { AuthCleanupService } from './services/auth-cleanup.service.js';
import { TokenManagerService } from './services/token-manager.service.js';
import { PasswordManagerService } from './services/password-manager.service.js';
import { AuthSessionService } from './services/auth-session.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GetProfileUseCase } from './use-cases/get-profile.use-case.js';
import { LoginUseCase } from './use-cases/login.use-case.js';
import { LogoutUseCase } from './use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case.js';
import { ValidateTokenUseCase } from './use-cases/validate-token.use-case.js';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case.js';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [
    NotificationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthRepository,
      useClass: PrismaAuthRepository,
    },

    TokenManagerService,
    PasswordManagerService,
    AuthCleanupService,
    AuthSessionService,

    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    ValidateTokenUseCase,
    ChangePasswordUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,

    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    TokenManagerService,
    PasswordManagerService,
    JwtAuthGuard,
    ValidateTokenUseCase,
    AuthSessionService,
  ],
})
export class AuthModule {}
