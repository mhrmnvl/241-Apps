import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../shared/domain/interfaces/repository.interface.js';
import { AdmissionAnnouncementEntity } from '../entities/admission-announcement.entity.js';

export type AdmissionAnnouncementWithWave = AdmissionAnnouncementEntity;

export interface AdmissionAnnouncementQueryInput extends PaginationQueryInput {
  search?: string;
  waveId?: string;
  isPublished?: boolean;
}

export interface CreateAdmissionAnnouncementRepositoryInput {
  title: string;
  content: string;
  /** Target wave; `null` means the announcement targets every wave. */
  waveId?: string | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
  createdById: string;
}

export interface UpdateAdmissionAnnouncementRepositoryInput {
  title?: string;
  content?: string;
  waveId?: string | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
}

export abstract class IAdmissionAnnouncementRepository {
  abstract findAll(
    query: AdmissionAnnouncementQueryInput,
  ): Promise<PaginatedResult<AdmissionAnnouncementEntity>>;
  abstract findById(id: string): Promise<AdmissionAnnouncementEntity | null>;
  abstract findActiveById(
    id: string,
  ): Promise<AdmissionAnnouncementEntity | null>;
  abstract create(
    input: CreateAdmissionAnnouncementRepositoryInput,
  ): Promise<AdmissionAnnouncementEntity>;
  abstract update(
    id: string,
    input: UpdateAdmissionAnnouncementRepositoryInput,
  ): Promise<AdmissionAnnouncementEntity>;
  abstract publish(id: string): Promise<AdmissionAnnouncementEntity>;
  abstract remove(id: string): Promise<AdmissionAnnouncementEntity>;
  abstract softDelete(id: string): Promise<AdmissionAnnouncementEntity>;
  abstract notifyScope(
    waveId: string | null,
    title: string,
    message: string,
  ): Promise<void>;
}
