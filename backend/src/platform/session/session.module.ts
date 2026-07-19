import { Module } from '@nestjs/common';
import { SessionController } from './presentation/session.controller.js';
import { GetUserSessionsUseCase } from './use-cases/get-user-sessions.use-case.js';
import { RevokeSessionUseCase } from './use-cases/revoke-session.use-case.js';
import { RevokeAllSessionsUseCase } from './use-cases/revoke-all-session.use-case.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [SessionController],
  providers: [
    GetUserSessionsUseCase,
    RevokeSessionUseCase,
    RevokeAllSessionsUseCase,
  ],
})
export class SessionModule {}
