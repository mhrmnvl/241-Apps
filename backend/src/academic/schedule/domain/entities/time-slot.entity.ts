import type { TimeSlotTypeEntity } from './time-slot-type.entity.js';

export interface TimeSlotEntity {
  id: string;
  typeId: string;
  name: string;
  startTime: Date | string;
  endTime: Date | string;
  order: number;
  deletedAt?: Date | null;
}

export interface TimeSlotWithType extends TimeSlotEntity {
  type?: TimeSlotTypeEntity;
}

export interface TimeSlotWithDetails extends TimeSlotEntity {
  type?: TimeSlotTypeEntity;
  schedules?: { id: string; teachingAssignmentId: string }[];
}
