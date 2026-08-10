import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  CredentialEntity,
  CredentialResolution,
  CredentialWithCode,
  CredentialWithHolder,
} from '../../domain/entities/credential.entity.js';
import {
  CreateCredentialRepositoryInput,
  CredentialQueryInput,
  ICredentialRepository,
  ReplaceCredentialRepositoryInput,
  RevokeCredentialRepositoryInput,
} from '../../domain/interfaces/credential-repository.interface.js';
import {
  CREDENTIAL_HOLDER_INCLUDE,
  toHolderRef,
} from './prisma-credential.includes.js';
import {
  credentialWhere,
  NOT_DELETED,
  validOnDateWhere,
} from './prisma-credential.where.js';

type RowWithUser = CredentialEntity & {
  code: string;
  user: {
    id: string;
    identifier: string;
    isActive: boolean;
    profile: { name: string; avatarFileId: string | null } | null;
  };
};

function withHolder(row: RowWithUser): CredentialWithHolder {
  const { user, code: _code, ...credential } = row;
  return { ...credential, holder: toHolderRef(user) };
}

function withCode(row: RowWithUser): CredentialWithCode {
  return { ...withHolder(row), code: row.code };
}

@Injectable()
export class PrismaCredentialRepository implements ICredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: CredentialQueryInput,
  ): Promise<PaginatedResult<CredentialWithHolder>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = credentialWhere(query);

    const [rows, total] = await Promise.all([
      this.prisma.presenceCredential.findMany({
        where,
        include: CREDENTIAL_HOLDER_INCLUDE,
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.presenceCredential.count({ where }),
    ]);

    return { data: rows.map(withHolder), total, page, limit };
  }

  async findById(id: string): Promise<CredentialWithHolder | null> {
    const row = await this.prisma.presenceCredential.findFirst({
      where: { id, ...NOT_DELETED },
      include: CREDENTIAL_HOLDER_INCLUDE,
    });

    return row ? withHolder(row) : null;
  }

  async findActiveByUserId(userId: string): Promise<CredentialEntity | null> {
    return this.prisma.presenceCredential.findFirst({
      where: { userId, status: 'ACTIVE', ...NOT_DELETED },
    });
  }

  async findByCode(code: string): Promise<CredentialResolution | null> {
    const row = await this.prisma.presenceCredential.findFirst({
      where: { code, ...NOT_DELETED },
      select: {
        id: true,
        userId: true,
        subjectType: true,
        status: true,
        user: {
          select: {
            isActive: true,
            profile: { select: { name: true, avatarFileId: true } },
          },
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      subjectType: row.subjectType,
      status: row.status,
      holderIsActive: row.user.isActive,
      displayName: row.user.profile?.name ?? null,
      photoUrl: row.user.profile?.avatarFileId
        ? `/files/${row.user.profile.avatarFileId}`
        : null,
    };
  }

  async findForPrint(userIds: string[]): Promise<CredentialWithCode[]> {
    const rows = await this.prisma.presenceCredential.findMany({
      where: { userId: { in: userIds }, status: 'ACTIVE', ...NOT_DELETED },
      include: CREDENTIAL_HOLDER_INCLUDE,
    });

    return rows.map(withCode);
  }

  async wasValidOnDate(userId: string, date: Date): Promise<boolean> {
    const count = await this.prisma.presenceCredential.count({
      where: validOnDateWhere(userId, date),
    });

    return count > 0;
  }

  async create(
    input: CreateCredentialRepositoryInput,
  ): Promise<CredentialWithCode> {
    const row = await this.prisma.presenceCredential.create({
      data: input,
      include: CREDENTIAL_HOLDER_INCLUDE,
    });

    return withCode(row);
  }

  async revoke(
    id: string,
    input: RevokeCredentialRepositoryInput,
  ): Promise<CredentialEntity> {
    return this.prisma.presenceCredential.update({
      where: { id },
      data: { status: 'REVOKED', ...input },
    });
  }

  /**
   * One transaction: the old card must never be usable while the new one is
   * also not yet issued, and the link between them is what keeps the holder's
   * history continuous across a replacement (FR-002).
   */
  async replace(
    input: ReplaceCredentialRepositoryInput,
  ): Promise<CredentialWithCode> {
    const { previousId, revokedAt, revokedReason, ...issue } = input;

    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.presenceCredential.create({
        data: issue,
        include: CREDENTIAL_HOLDER_INCLUDE,
      });

      await tx.presenceCredential.update({
        where: { id: previousId },
        data: {
          status: 'REPLACED',
          revokedAt,
          revokedReason,
          replacedById: created.id,
        },
      });

      return created;
    });

    return withCode(row);
  }

  async softDelete(id: string): Promise<CredentialEntity> {
    return this.prisma.presenceCredential.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
