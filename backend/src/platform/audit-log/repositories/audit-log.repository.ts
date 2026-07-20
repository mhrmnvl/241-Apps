import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AuditLogQueryDto } from '../dto/request/audit-log-query.dto.js';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AuditLogQueryDto) {
    const { page = 1, limit = 10, search, userId, action, resource } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(resource && { resource }),
      ...(search && {
        OR: [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { userAgent: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              identifier: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async create(data: {
    userId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId ?? null,
        metadata: data.metadata ?? Prisma.JsonNull,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }
}
