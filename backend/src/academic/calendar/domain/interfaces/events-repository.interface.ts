import { Event, Prisma } from '@prisma/client';
import type { CreateEventDto } from '../../dto/request/create-event.dto.js';
import type { EventQueryDto } from '../../dto/request/event-query.dto.js';
import type { UpdateEventDto } from '../../dto/request/update-event.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const EVENT_INCLUDE = {
  classrooms: { include: { classroom: true } },
  audiences: { include: { audienceGroup: true } },
} satisfies Prisma.EventInclude;

export type EventWithDetails = Prisma.EventGetPayload<{
  include: typeof EVENT_INCLUDE;
}>;

export abstract class IEventsRepository {
  abstract findAll(
    query: EventQueryDto,
  ): Promise<PaginatedResult<EventWithDetails>>;

  abstract findById(id: string): Promise<EventWithDetails | null>;

  abstract create(dto: CreateEventDto): Promise<EventWithDetails>;

  abstract update(id: string, dto: UpdateEventDto): Promise<EventWithDetails>;

  abstract softDelete(id: string): Promise<Event>;

  abstract findAllAudienceGroups(): Promise<
    { id: string; name: string; description: string | null }[]
  >;
}
