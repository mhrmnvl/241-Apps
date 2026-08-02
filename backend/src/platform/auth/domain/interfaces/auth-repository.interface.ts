import {
  CreateSessionData,
  UpdateSessionTokenData,
} from '../../types/auth-session.types.js';
import { UserEntity } from '../../../../shared/domain/entities/user.entity.js';
import {
  AuthSessionEntity,
  PasswordResetTokenEntity,
} from '../entities/auth-session.entity.js';
import {
  UserWithProfileAndRoles,
  SessionWithUser,
  PasswordResetTokenWithUser,
} from '../entities/auth-session.entity.js';

export type {
  UserWithProfileAndRoles,
  SessionWithUser,
  PasswordResetTokenWithUser,
};

export abstract class IAuthRepository {
  abstract findUserByIdentifier(
    identifier: string,
  ): Promise<(UserEntity & { userRoles: { role: { code: string } }[] }) | null>;

  abstract findUserById(
    userId: string,
  ): Promise<UserWithProfileAndRoles | null>;

  abstract findSessionWithUser(
    sessionId: string,
  ): Promise<SessionWithUser | null>;

  abstract createSession(data: CreateSessionData): Promise<AuthSessionEntity>;

  abstract updateSessionToken(
    sessionId: string,
    data: UpdateSessionTokenData,
  ): Promise<AuthSessionEntity>;

  abstract revokeSession(sessionId: string): Promise<AuthSessionEntity>;

  abstract deleteExpiredSessions(
    now: Date,
    auditRetentionMs: number,
  ): Promise<{ count: number }>;

  abstract updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<UserEntity>;

  abstract revokeAllOtherUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<{ count: number }>;

  abstract createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenEntity>;

  abstract findActivePasswordResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenWithUser | null>;

  abstract markPasswordResetTokenAsUsed(
    tokenId: string,
  ): Promise<PasswordResetTokenEntity>;

  abstract findUserSessions(userId: string): Promise<AuthSessionEntity[]>;

  abstract revokeAll(userId: string): Promise<{ count: number }>;
}
