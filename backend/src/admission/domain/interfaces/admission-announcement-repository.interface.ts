import { AdmissionAnnouncement, Prisma } from '@prisma/client';
import { AdmissionAnnouncementQueryDto } from '../../dto/admission-announcement.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';

export type AdmissionAnnouncementWithWave =
  Prisma.AdmissionAnnouncementGetPayload<{
    include: { wave: { select: { id: true; name: true; code: true } } };
  }>;

export interface CreateAdmissionAnnouncementRepositoryInput {
  title: string;
  content: string;
  waveId: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdById: string;
}

export abstract class IAdmissionAnnouncementRepository {
  abstract findAll(
    query: AdmissionAnnouncementQueryDto,
  ): Promise<PaginatedResult<AdmissionAnnouncementWithWave>>;
  abstract findActiveById(id: string): Promise<AdmissionAnnouncement | null>;
  abstract create(
    data: CreateAdmissionAnnouncementRepositoryInput,
  ): Promise<AdmissionAnnouncementWithWave>;
  abstract update(
    id: string,
    data: Prisma.AdmissionAnnouncementUncheckedUpdateInput,
  ): Promise<AdmissionAnnouncementWithWave>;
  abstract publish(id: string): Promise<AdmissionAnnouncementWithWave>;
  abstract softDelete(id: string): Promise<AdmissionAnnouncement>;

  /**
   * Fan out an in-app notification to every (non-deleted) application in the
   * announcement's scope. `waveId = null` targets all applications.
   */
  abstract notifyScope(
    waveId: string | null,
    title: string,
    message: string,
  ): Promise<void>;
}
