import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  EventEntity,
  EventWithDetails,
} from '../entities/academic-calendar.entity.js';

export type { EventWithDetails };

export interface AudienceGroupRow {
  id: string;
  name: string;
  description: string | null;
}

export interface EventQueryInput extends PaginationQueryInput {
  classroomId?: string;
  audienceGroupId?: string;
  search?: string;
}

export interface CreateEventRepositoryInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  audienceGroupIds?: string[];
  classroomIds?: string[];
}

export type UpdateEventRepositoryInput = Partial<CreateEventRepositoryInput>;

export abstract class IEventRepository {
  abstract findAll(
    query: EventQueryInput,
  ): Promise<PaginatedResult<EventWithDetails>>;
  abstract findById(id: string): Promise<EventWithDetails | null>;
  abstract create(input: CreateEventRepositoryInput): Promise<EventWithDetails>;
  abstract update(
    id: string,
    input: UpdateEventRepositoryInput,
  ): Promise<EventWithDetails>;
  abstract remove(id: string): Promise<EventEntity>;
  abstract softDelete(id: string): Promise<EventEntity>;
  abstract findAllAudienceGroups(): Promise<AudienceGroupRow[]>;
}
