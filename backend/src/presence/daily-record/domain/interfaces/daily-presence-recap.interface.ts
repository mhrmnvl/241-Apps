import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';
import {
  DailyPresenceEntity,
  PresenceDayStatusEnum,
} from '../entities/daily-presence.entity.js';

export interface RecapQueryInput {
  year: number;
  month: number;
  subjectType?: PresenceSubjectTypeEnum;
  userId?: string;
}

export interface PresenceRecapRow {
  userId: string;
  displayName: string | null;
  presentDays: number;
  absentDays: number;
  lateCount: number;
  lateMinutes: number;
  earlyLeaveCount: number;
  leaveDays: number;
  officialDutyDays: number;
  attendanceRate: number;
}

export interface PresenceRecap {
  period: {
    year: number;
    month: number;
    status: 'OPEN' | 'CLOSED';
    workingDays: number;
  };
  rows: PresenceRecapRow[];
}

export interface DailyPresenceQueryInput {
  date: Date;
  subjectType?: PresenceSubjectTypeEnum;
  userId?: string;
  status?: PresenceDayStatusEnum;
  page?: number;
  limit?: number;
}

export interface DailyPresenceHolderRef {
  id: string;
  displayName: string | null;
  identifier: string;
}

export interface DailyPresenceWithDetails extends DailyPresenceEntity {
  holder: DailyPresenceHolderRef;
  /** True when any correction exists — resolved in one query, not per row. */
  corrected: boolean;
}
