import { Injectable } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { CreateAdmissionAnnouncementDto } from '../dto/request/create-admission-announcement.dto.js';

@Injectable()
export class CreateAdmissionAnnouncementUseCase {
  constructor(
    private readonly admissionAnnouncementRepository: IAdmissionAnnouncementRepository,
  ) {}

  async execute(dto: CreateAdmissionAnnouncementDto, createdById: string) {
    return this.admissionAnnouncementRepository.create({
      title: dto.title,
      content: dto.content,
      waveId: dto.waveId ?? null,
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : null,
      createdById,
    });
  }
}
