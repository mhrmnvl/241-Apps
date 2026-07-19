import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service.js';
import {
  AdmissionAnnouncementQueryDto,
  CreateAdmissionAnnouncementDto,
  UpdateAdmissionAnnouncementDto,
} from '../dto/admission-announcement.dto.js';
@Injectable()
export class GetAdmissionAnnouncementsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AdmissionAnnouncementQueryDto) {
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
        include: { wave: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionAnnouncement.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class CreateAdmissionAnnouncementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAdmissionAnnouncementDto, createdById: string) {
    return this.prisma.admissionAnnouncement.create({
      data: {
        title: dto.title,
        content: dto.content,
        waveId: dto.waveId ?? null,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        createdById,
      },
      include: { wave: { select: { id: true, name: true, code: true } } },
    });
  }
}

@Injectable()
export class UpdateAdmissionAnnouncementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateAdmissionAnnouncementDto) {
    const announcement = await this.prisma.admissionAnnouncement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const becomingPublished =
      dto.isPublished === true && !announcement.isPublished;

    return this.prisma.admissionAnnouncement.update({
      where: { id },
      data: {
        ...dto,
        ...(becomingPublished && { publishedAt: new Date() }),
      },
      include: { wave: { select: { id: true, name: true, code: true } } },
    });
  }
}

@Injectable()
export class PublishAdmissionAnnouncementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const announcement = await this.prisma.admissionAnnouncement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const updated = await this.prisma.admissionAnnouncement.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      include: { wave: { select: { id: true, name: true, code: true } } },
    });

    // Fan out an in-app notification to all (non-terminal) applications in scope.
    const applications = await this.prisma.admissionApplication.findMany({
      where: {
        deletedAt: null,
        ...(announcement.waveId && { waveId: announcement.waveId }),
      },
      select: { id: true },
    });
    if (applications.length > 0) {
      await this.prisma.admissionNotification.createMany({
        data: applications.map((app) => ({
          applicationId: app.id,
          type: 'ANNOUNCEMENT' as const,
          title: announcement.title,
          message: announcement.content,
        })),
      });
    }

    return updated;
  }
}

@Injectable()
export class DeleteAdmissionAnnouncementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const announcement = await this.prisma.admissionAnnouncement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    return this.prisma.admissionAnnouncement.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }
}
