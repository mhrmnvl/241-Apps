import { Injectable } from '@nestjs/common';
import { MonthlyPresenceSummary } from '../../../presence/daily-record/domain/interfaces/daily-presence-read.port.js';

export type AttendanceDriverKey =
  | 'PRESENT_DAYS'
  | 'ABSENT_DAYS'
  | 'LATE_COUNT'
  | 'LATE_MINUTES'
  | 'EARLY_LEAVE_COUNT'
  | 'LEAVE_DAYS'
  | 'OFFICIAL_DUTY_DAYS';

/**
 * Turns a month's attendance into the count a driven component multiplies.
 *
 * Reads the summary through `IDailyPresenceReadPort` — never
 * `this.prisma.dailyPresence`. Payroll owns salary tables; presence owns
 * attendance tables, and the single Prisma client is exactly what would let
 * that boundary quietly dissolve (Principle VI).
 */
@Injectable()
export class AttendanceDriverService {
  countFor(
    driver: AttendanceDriverKey,
    summary: MonthlyPresenceSummary,
  ): number {
    switch (driver) {
      case 'PRESENT_DAYS':
        return summary.presentDays;
      case 'ABSENT_DAYS':
        return summary.absentDays;
      case 'LATE_COUNT':
        return summary.lateCount;
      case 'LATE_MINUTES':
        return summary.lateMinutes;
      case 'EARLY_LEAVE_COUNT':
        return summary.earlyLeaveCount;
      case 'LEAVE_DAYS':
        return summary.leaveDays;
      case 'OFFICIAL_DUTY_DAYS':
        return summary.officialDutyDays;
    }
  }

  /**
   * An employee with no attendance rows at all — long leave, a new hire, or a
   * month before their card was issued — still gets a defensible figure rather
   * than a blank or a crash (FR-054).
   */
  blank(userId: string): MonthlyPresenceSummary {
    return {
      userId,
      presentDays: 0,
      absentDays: 0,
      lateCount: 0,
      lateMinutes: 0,
      earlyLeaveCount: 0,
      leaveDays: 0,
      officialDutyDays: 0,
    };
  }
}
