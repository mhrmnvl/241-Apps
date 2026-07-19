import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';

@Injectable()
export class GetActiveWavesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const today = new Date();

    const [waves, documentTypes] = await Promise.all([
      this.prisma.admissionWave.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          startDate: { lte: today },
          endDate: { gte: today },
        },
        include: {
          academicYear: true,
          _count: {
            select: {
              applications: {
                where: { status: { not: 'REJECTED' }, deletedAt: null },
              },
            },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.admissionDocumentType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      waves: waves.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        academicYear: w.academicYear.name,
        startDate: w.startDate,
        endDate: w.endDate,
        quota: w.quota,
        remainingQuota: Math.max(w.quota - w._count.applications, 0),
        registrationFee: Number(w.registrationFee),
        description: w.description,
      })),
      documentTypes,
    };
  }
}
