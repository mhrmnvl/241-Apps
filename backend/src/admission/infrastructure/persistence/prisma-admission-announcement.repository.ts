import { Injectable } from '@nestjs/common';
import { AdmissionAnnouncement, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AdmissionAnnouncementQueryDto } from '../../dto/admission-announcement.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';
import {
  AdmissionAnnouncementWithWave,
  CreateAdmissionAnnouncementRepositoryInput,
  IAdmissionAnnouncementRepository,
} from '../../domain/interfaces/admission-announcement-repository.interface.js';

const WAVE_SELECT = {
  wave: { select: { id: true, name: true, code: true } },
} satisfies Prisma.AdmissionAnnouncementInclude;

@Injectable()
export class PrismaAdmissionAnnouncementRepository extends IAdmissionAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AdmissionAnnouncementQueryDto,
  ): Promise<PaginatedResult<AdmissionAnnouncementWithWave>> {
    const { page = 1, limit = 10, search, waveId, isPublished } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionAnnouncementWhereInput = {
      deletedAt: null,
      ...(waveId && { waveId }),
      ...(isPublished !== undefined && { isPublished }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.admissionAnnouncement.findMany({
        where,
        skip,
        take: limit,
        include: WAVE_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionAnnouncement.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findActiveById(id: string): Promise<AdmissionAnnouncement | null> {
    return this.prisma.admissionAnnouncement.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(
    data: CreateAdmissionAnnouncementRepositoryInput,
  ): Promise<AdmissionAnnouncementWithWave> {
    return this.prisma.admissionAnnouncement.create({
      data,
      include: WAVE_SELECT,
    });
  }

  async update(
    id: string,
    data: Prisma.AdmissionAnnouncementUncheckedUpdateInput,
  ): Promise<AdmissionAnnouncementWithWave> {
    return this.prisma.admissionAnnouncement.update({
      where: { id },
      data,
      include: WAVE_SELECT,
    });
  }

  async publish(id: string): Promise<AdmissionAnnouncementWithWave> {
    return this.prisma.admissionAnnouncement.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      include: WAVE_SELECT,
    });
  }

  async softDelete(id: string): Promise<AdmissionAnnouncement> {
    return this.prisma.admissionAnnouncement.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }

  async notifyScope(
    waveId: string | null,
    title: string,
    message: string,
  ): Promise<void> {
    const applications = await this.prisma.admissionApplication.findMany({
      where: {
        deletedAt: null,
        ...(waveId && { waveId }),
      },
      select: { id: true },
    });
    if (applications.length === 0) return;

    await this.prisma.admissionNotification.createMany({
      data: applications.map((app) => ({
        applicationId: app.id,
        type: 'ANNOUNCEMENT' as const,
        title,
        message,
      })),
    });
  }
}
