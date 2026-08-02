import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { AnnouncementEntity } from '../entities/announcement.entity.js';
import { AnnouncementWithDetails } from '../entities/announcement.entity.js';

export type { AnnouncementWithDetails };

export interface AnnouncementQueryInput {
  page?: number;
  limit?: number;
  classroomId?: string;
  search?: string;
}

export abstract class IAnnouncementRepository {
  abstract findAll(
    query: AnnouncementQueryInput,
  ): Promise<PaginatedResult<AnnouncementWithDetails>>;

  abstract findById(id: string): Promise<AnnouncementWithDetails | null>;
  abstract create(data: {
    title: string;
    description: string;
    date: Date;
    classroomIds?: string[];
  }): Promise<AnnouncementWithDetails>;

  abstract update(
    id: string,
    data: { title?: string; description?: string; date?: Date },
    classroomIds?: string[],
  ): Promise<AnnouncementWithDetails>;

  abstract softDelete(id: string): Promise<AnnouncementEntity>;
}
