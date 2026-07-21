import { Prisma, TimeSlot, TimeSlotType } from '@prisma/client';
import { CreateTimeSlotDto } from '../../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../../dto/request/update-time-slot.dto.js';
import { CreateTimeSlotTypeDto } from '../../dto/request/create-time-slot-type.dto.js';
import { UpdateTimeSlotTypeDto } from '../../dto/request/update-time-slot-type.dto.js';

export const TIME_SLOT_INCLUDE = {
  type: true,
} satisfies Prisma.TimeSlotInclude;

export type TimeSlotWithDetails = Prisma.TimeSlotGetPayload<{
  include: typeof TIME_SLOT_INCLUDE;
}>;

export abstract class ITimeSlotRepository {
  abstract findAll(): Promise<TimeSlotWithDetails[]>;
  abstract findAllTypes(): Promise<TimeSlotType[]>;
  abstract findTypeById(id: string): Promise<TimeSlotType | null>;
  abstract findTypeByCode(
    code: string,
    excludeId?: string,
  ): Promise<TimeSlotType | null>;
  abstract createType(dto: CreateTimeSlotTypeDto): Promise<TimeSlotType>;
  abstract updateType(
    id: string,
    dto: UpdateTimeSlotTypeDto,
  ): Promise<TimeSlotType>;
  abstract removeType(id: string): Promise<TimeSlotType>;
  abstract countSlotsUsingType(typeId: string): Promise<number>;
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
