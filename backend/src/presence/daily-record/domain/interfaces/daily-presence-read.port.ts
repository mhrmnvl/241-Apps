import { PresenceDayStatusEnum } from '../entities/daily-presence.entity.js';

/**
 * What `academic/attendance` sees of the gate: enough to pre-fill a class, and
 * nothing more.
 *
 * The direction is one-way by design — `academic/` reads from here and
 * `presence/` never reads back, which is what keeps the domain graph acyclic
 * (ADR-0007). Presence does not know classrooms exist, so the caller resolves
 * enrolments to user IDs before asking.
 */
export interface GateSuggestion {
  userId: string;
  status: PresenceDayStatusEnum;
  checkInAt: Date | null;
  lateMinutes: number;
}

export interface MonthlyPresenceSummary {
  userId: string;
  presentDays: number;
  absentDays: number;
  lateCount: number;
  lateMinutes: number;
  earlyLeaveCount: number;
  leaveDays: number;
  officialDutyDays: number;
}

export abstract class IDailyPresenceReadPort {
  abstract findByUsersAndDate(
    userIds: string[],
    date: Date,
  ): Promise<GateSuggestion[]>;

  abstract summariseMonth(
    userIds: string[],
    year: number,
    month: number,
  ): Promise<MonthlyPresenceSummary[]>;
}
