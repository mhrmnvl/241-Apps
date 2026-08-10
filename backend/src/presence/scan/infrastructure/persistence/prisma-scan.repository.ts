import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ScanEntity } from '../../domain/entities/scan.entity.js';
import {
  IScanRepository,
  RecordScanRepositoryInput,
  ScanQueryInput,
  ScanWithDevice,
} from '../../domain/interfaces/scan-repository.interface.js';

/** Append-only evidence log: no soft delete, nothing edits a scan. */
@Injectable()
export class PrismaScanRepository implements IScanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ScanQueryInput,
  ): Promise<PaginatedResult<ScanWithDevice>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PresenceScanWhereInput = {
      ...(query.deviceId && { deviceId: query.deviceId }),
      ...(query.credentialId && { credentialId: query.credentialId }),
      ...(query.outcome && { outcome: query.outcome }),
      ...((query.dateFrom ?? query.dateTo) && {
        occurredAt: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.presenceScan.findMany({
        where,
        include: { device: { select: { id: true, name: true } } },
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.presenceScan.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findByClientEventId(
    deviceId: string,
    clientEventId: string,
  ): Promise<ScanEntity | null> {
    return this.prisma.presenceScan.findUnique({
      where: { deviceId_clientEventId: { deviceId, clientEventId } },
    });
  }

  async findLastAccepted(credentialId: string): Promise<ScanEntity | null> {
    return this.prisma.presenceScan.findFirst({
      where: { credentialId, outcome: 'ACCEPTED' },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async record(input: RecordScanRepositoryInput): Promise<ScanEntity> {
    return this.prisma.presenceScan.create({ data: input });
  }
}
