import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { AdmissionAnnouncementQueryDto } from '../dto/request/admission-announcement-query.dto.js';
import { CreateAdmissionAnnouncementDto } from '../dto/request/create-admission-announcement.dto.js';
import { UpdateAdmissionAnnouncementDto } from '../dto/request/update-admission-announcement.dto.js';

@Injectable()
export class GetAdmissionAnnouncementsUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(query: AdmissionAnnouncementQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class CreateAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(dto: CreateAdmissionAnnouncementDto, createdById: string) {
    return this.repository.create({
      title: dto.title,
      content: dto.content,
      waveId: dto.waveId ?? null,
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : null,
      createdById,
    });
  }
}

@Injectable()
export class UpdateAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(id: string, dto: UpdateAdmissionAnnouncementDto) {
    const announcement = await this.repository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const becomingPublished =
      dto.isPublished === true && !announcement.isPublished;

    return this.repository.update(id, {
      ...dto,
      ...(becomingPublished && { publishedAt: new Date() }),
    });
  }
}

@Injectable()
export class PublishAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(id: string) {
    const announcement = await this.repository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const updated = await this.repository.publish(id);

    // Fan out an in-app notification to all applications in scope.
    await this.repository.notifyScope(
      announcement.waveId,
      announcement.title,
      announcement.content,
    );

    return updated;
  }
}

@Injectable()
export class DeleteAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(id: string) {
    const announcement = await this.repository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    return this.repository.softDelete(id);
  }
}
