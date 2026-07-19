import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';

@Injectable()
export class GetMyApplicationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      include: applicationDetailInclude,
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    const documentTypes = await this.prisma.admissionDocumentType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return { ...serializeApplicationDetail(application), documentTypes };
  }
}
