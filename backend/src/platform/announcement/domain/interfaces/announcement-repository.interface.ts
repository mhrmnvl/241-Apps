import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { AnnouncementEntity } from '../entities/announcement.entity.js';
import { AnnouncementWithDetails } from '../entities/announcement.entity.js';

export type { AnnouncementWithDetails };

export interface AnnouncementQueryInput {
  page?: number;
  limit?: number;
  classroomId?: string;
  /**
   * Whose noticeboard this is: everything addressed to the whole school, plus
   * everything addressed to this class.
   *
   * Different from `classroomId`, which matches one class exactly and is what
   * the management filter uses. A student asking what is on their noticeboard
   * would lose every school-wide notice under that filter, which is most of
   * them.
   *
   * `null` means school-wide only — the honest answer for somebody with no
   * enrolment this term. `undefined` means no audience filter at all, which is
   * the management list.
   */
  audienceClassroomId?: string | null;
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
