import { Injectable } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { CreateAdmissionAnnouncementDto } from '../dto/request/create-admission-announcement.dto.js';

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
