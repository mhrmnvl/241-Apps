import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';
import {
  DailyPresenceQueryInput,
  DailyPresenceWithDetails,
  PresenceRecapRow,
  RecapQueryInput,
} from './daily-presence-recap.interface.js';
import {
  DailyPresenceEntity,
  PresenceDayStatusEnum,
  PresenceValueSourceEnum,
} from '../entities/daily-presence.entity.js';

export interface UpsertCheckInInput {
  userId: string;
  subjectType: PresenceSubjectTypeEnum;
  date: Date;
  checkInAt: Date;
  status: PresenceDayStatusEnum;
  lateMinutes: number;
  workPatternId: string | null;
  source: PresenceValueSourceEnum;
}

export interface RecordCheckOutInput {
  id: string;
  checkOutAt: Date;
  earlyLeaveMinutes: number;
  source: PresenceValueSourceEnum;
}

export interface ManualPresenceInput {
  userId: string;
  subjectType: PresenceSubjectTypeEnum;
  date: Date;
  status: PresenceDayStatusEnum;
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  lateMinutes: number;
  workPatternId: string | null;
  note?: string | null;
}

/** Only the fields a correction may touch. */
export interface CorrectPresenceInput {
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  status?: PresenceDayStatusEnum;
  note?: string | null;
}

export abstract class IDailyPresenceRepository {
  abstract findAll(
    query: DailyPresenceQueryInput,
  ): Promise<PaginatedResult<DailyPresenceWithDetails>>;
  abstract findByUserAndMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<DailyPresenceEntity[]>;
  abstract getRecap(query: RecapQueryInput): Promise<PresenceRecapRow[]>;
  abstract countWorkingDays(year: number, month: number): Promise<number>;
  abstract findById(id: string): Promise<DailyPresenceEntity | null>;
  abstract findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<DailyPresenceEntity | null>;
  abstract upsertCheckIn(
    input: UpsertCheckInInput,
  ): Promise<DailyPresenceEntity>;
  abstract recordCheckOut(
    input: RecordCheckOutInput,
  ): Promise<DailyPresenceEntity>;
  abstract createManual(
    input: ManualPresenceInput,
  ): Promise<DailyPresenceEntity>;
  /** Every touched field is stamped MANUAL, which is what FR-014 renders. */
  abstract correct(
    id: string,
    input: CorrectPresenceInput,
  ): Promise<DailyPresenceEntity>;
}
