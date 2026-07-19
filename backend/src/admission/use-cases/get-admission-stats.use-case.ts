import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';

@Injectable()
export class GetAdmissionStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(waveId?: string) {
    const where = {
      deletedAt: null,
      ...(waveId && { waveId }),
    };

    const [byStatus, waves] = await Promise.all([
      this.prisma.admissionApplication.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.admissionWave.findMany({
        where: { deletedAt: null, ...(waveId && { id: waveId }) },
        include: {
          _count: {
            select: {
              applications: {
                where: {
                  status: { in: ['ACCEPTED', 'ENROLLED'] },
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    const statusCounts = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count._all]),
    );
    const total = byStatus.reduce((sum, s) => sum + s._count._all, 0);

    return {
      total,
      byStatus: statusCounts,
      waves: waves.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        quota: w.quota,
        accepted: w._count.applications,
        quotaFillRate: w.quota > 0 ? w._count.applications / w.quota : 0,
      })),
    };
  }
}
