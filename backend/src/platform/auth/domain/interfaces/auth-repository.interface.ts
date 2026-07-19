import { User, AuthSession, PasswordResetToken, Prisma } from '@prisma/client';
import {
  CreateSessionData,
  UpdateSessionTokenData,
} from '../../types/auth-session.types.js';

export type UserWithProfileAndRoles = Prisma.UserGetPayload<{
  include: {
    profile: true;
    userRoles: { include: { role: true } };
  };
}>;

export type SessionWithUser = Prisma.AuthSessionGetPayload<{
  include: { user: true };
}>;

export type PasswordResetTokenWithUser = Prisma.PasswordResetTokenGetPayload<{
  include: { user: true };
}>;

export abstract class IAuthRepository {
  abstract findUserByIdentifier(identifier: string): Promise<User | null>;

  abstract findUserById(
    userId: string,
  ): Promise<UserWithProfileAndRoles | null>;

  abstract findSessionWithUser(
    sessionId: string,
  ): Promise<SessionWithUser | null>;

  abstract createSession(data: CreateSessionData): Promise<AuthSession>;

  abstract updateSessionToken(
    sessionId: string,
    data: UpdateSessionTokenData,
  ): Promise<AuthSession>;

  abstract revokeSession(sessionId: string): Promise<AuthSession>;

  abstract deleteExpiredSessions(
    now: Date,
    auditRetentionMs: number,
  ): Promise<{ count: number }>;

  abstract updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<User>;

  abstract revokeAllOtherUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<Prisma.BatchPayload>;

  abstract createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken>;

  abstract findActivePasswordResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenWithUser | null>;

  abstract markPasswordResetTokenAsUsed(
    tokenId: string,
  ): Promise<PasswordResetToken>;

  abstract findUserSessions(userId: string): Promise<AuthSession[]>;

  abstract revokeAll(userId: string): Promise<Prisma.BatchPayload>;
}
