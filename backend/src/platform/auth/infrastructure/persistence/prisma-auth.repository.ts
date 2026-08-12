import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateSessionData,
  UpdateSessionTokenData,
} from '../../types/auth-session.types.js';
import { IAuthRepository } from '../../domain/interfaces/auth-repository.interface.js';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

@Injectable()
export class PrismaAuthRepository extends IAuthRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findUserByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
      include: {
        userRoles: { include: { role: true } },
      },
    });
  }

  // Pulls the role → permission edge because GET /auth/me is what every
  // frontend bootstraps its authorization from. Without it the caller would
  // have to reach for /profiles/me, whose include graph is six levels deep and
  // is maintained for the profile page, not for session bootstrap.
  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Name only: the two callers are GET /auth/me, which returns the name
        // and nothing else of the profile, and change-password, which reads no
        // profile at all. This row is now read on every cold start of all five
        // apps, so the columns it does not need are the ones worth not reading.
        profile: PROFILE_NAME_SELECT,
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
  }

  async findSessionWithUser(sessionId: string) {
    return this.prisma.authSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
  }

  async createSession(data: CreateSessionData) {
    return this.prisma.authSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        userAgent: data.userAgent?.substring(0, 512),
        ipAddress: data.ipAddress?.substring(0, 64),
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateSessionToken(sessionId: string, data: UpdateSessionTokenData) {
    return this.prisma.authSession.update({
      where: { id: sessionId },
      data: {
        tokenHash: data.tokenHash,
        lastUsedAt: data.lastUsedAt,
        expiresAt: data.expiresAt,
      },
    });
  }

  async revokeSession(sessionId: string) {
    return this.prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpiredSessions(now: Date, auditRetentionMs: number) {
    return this.prisma.authSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          {
            revokedAt: {
              not: null,
              lt: new Date(now.getTime() - auditRetentionMs),
            },
          },
        ],
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async revokeAllOtherUserSessions(userId: string, currentSessionId: string) {
    return this.prisma.authSession.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findActivePasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  async markPasswordResetTokenAsUsed(tokenId: string) {
    return this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  async findUserSessions(userId: string) {
    return this.prisma.authSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async revokeAll(userId: string) {
    return this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
