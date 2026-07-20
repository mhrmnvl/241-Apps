import { Prisma, TimeSlot } from '@prisma/client';
import { CreateTimeSlotDto } from '../../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../../dto/request/update-time-slot.dto.js';

export const TIME_SLOT_INCLUDE = {
  type: true,
} satisfies Prisma.TimeSlotInclude;

export type TimeSlotWithDetails = Prisma.TimeSlotGetPayload<{
  include: typeof TIME_SLOT_INCLUDE;
}>;

export abstract class ITimeSlotRepository {
  abstract findAll(): Promise<TimeSlotWithDetails[]>;
  abstract findById(id: string): Promise<TimeSlotWithDetails | null>;
  abstract findByOrder(
    order: number,
    excludeId?: string,
  ): Promise<TimeSlotWithDetails | null>;
  abstract create(dto: CreateTimeSlotDto): Promise<TimeSlotWithDetails>;
  abstract update(
    id: string,
    dto: UpdateTimeSlotDto,
  ): Promise<TimeSlotWithDetails>;
  abstract remove(id: string): Promise<TimeSlot>;
  abstract countSchedulesUsing(timeSlotId: string): Promise<number>;
}
