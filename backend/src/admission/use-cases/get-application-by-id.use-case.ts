import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';

@Injectable()
export class GetApplicationByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...applicationDetailInclude,
        religion: true,
        user: { select: { id: true, identifier: true, lastLoginAt: true } },
      },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    // Duplicate-NIK warning for admins (NIK is intentionally not unique here).
    let duplicateNikCount = 0;
    if (application.nik) {
      duplicateNikCount = await this.prisma.admissionApplication.count({
        where: {
          nik: application.nik,
          id: { not: application.id },
          deletedAt: null,
        },
      });
    }

    const documentTypes = await this.prisma.admissionDocumentType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      ...serializeApplicationDetail(application),
      duplicateNikCount,
      documentTypes,
    };
  }
}
