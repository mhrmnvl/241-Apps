import {
  TimeSlotEntity,
  TimeSlotTypeEntity,
} from '../entities/time-slot.entity.js';
import {
  TimeSlotWithType as TimeSlotWithDetails,
  TimeSlotWithType,
} from '../entities/time-slot.entity.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';

export type { TimeSlotWithDetails, TimeSlotWithType };

export type TimeSlotQueryInput = PaginationQueryInput;

export interface CreateTimeSlotRepositoryInput {
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  typeId: string;
}

export type UpdateTimeSlotRepositoryInput =
  Partial<CreateTimeSlotRepositoryInput>;

export interface CreateTimeSlotTypeRepositoryInput {
  code: string;
  name: string;
  isLesson?: boolean;
  /** Weekdays this type applies to; empty means every day. */
  days?: DayEnum[];
}

export type UpdateTimeSlotTypeRepositoryInput =
  Partial<CreateTimeSlotTypeRepositoryInput>;

export abstract class ITimeSlotRepository {
  abstract findAll(
    query?: TimeSlotQueryInput,
  ): Promise<PaginatedResult<TimeSlotWithType>>;
  abstract findById(id: string): Promise<TimeSlotWithType | null>;
  abstract findTypeById(id: string): Promise<TimeSlotTypeEntity | null>;
  abstract findTypeByCode(code: string): Promise<TimeSlotTypeEntity | null>;
  abstract findOverlappingSlot(
    typeId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<TimeSlotWithType | null>;
  abstract create(
    input: CreateTimeSlotRepositoryInput,
  ): Promise<TimeSlotWithType>;
  abstract update(
    id: string,
    input: UpdateTimeSlotRepositoryInput,
  ): Promise<TimeSlotWithType>;
  abstract remove(id: string): Promise<TimeSlotEntity>;
  abstract countSchedulesWithTimeSlot(id: string): Promise<number>;

  abstract createType(
    input: CreateTimeSlotTypeRepositoryInput,
  ): Promise<TimeSlotTypeEntity>;
  abstract updateType(
    id: string,
    input: UpdateTimeSlotTypeRepositoryInput,
  ): Promise<TimeSlotTypeEntity>;
  abstract removeType(id: string): Promise<TimeSlotTypeEntity>;
  abstract findAllTypes(): Promise<TimeSlotTypeEntity[]>;
  abstract findByOrder(
    order: number,
    excludeId?: string,
  ): Promise<TimeSlotWithType | null>;
  abstract countSlotsUsingType(typeId: string): Promise<number>;
  abstract countSchedulesUsing(slotId: string): Promise<number>;
}
