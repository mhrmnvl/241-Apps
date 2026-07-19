import { Announcement, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ANNOUNCEMENT_INCLUDE = {
  classrooms: { include: { classroom: true } },
} satisfies Prisma.AnnouncementInclude;

export type AnnouncementWithDetails = Prisma.AnnouncementGetPayload<{
  include: typeof ANNOUNCEMENT_INCLUDE;
}>;

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

  abstract softDelete(id: string): Promise<Announcement>;
}
