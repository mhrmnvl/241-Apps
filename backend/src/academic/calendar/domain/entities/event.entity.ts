import { NamedRef } from '../../../../shared/domain/entities/index.js';

export interface EventEntity {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface EventWithDetails extends EventEntity {
  audiences?: { audienceGroupId: string; audienceGroup?: NamedRef }[];
}
