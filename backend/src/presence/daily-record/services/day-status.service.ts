import { Injectable } from '@nestjs/common';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import {
  IWorkPatternRepository,
  ResolvedPattern,
} from '../../work-pattern/domain/interfaces/work-pattern-repository.interface.js';
import { PresenceDayStatusEnum } from '../domain/entities/daily-presence.entity.js';

export interface ArrivalVerdict {
  status: PresenceDayStatusEnum;
  lateMinutes: number;
  workPatternId: string | null;
}

/** Minutes from midnight for an "HH:mm" wall-clock time. */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Minutes from midnight of the instant, in the same wall-clock frame. */
function minutesOfDay(at: Date): number {
  return at.getUTCHours() * 60 + at.getUTCMinutes();
}

/**
 * Turns a scan into a day status.
 *
 * `NOT_EXPECTED` has **three** causes and all three are checked before a day
 * with no arrival may become `ABSENT` (FR-011):
 *
 *   1. the date is a holiday,
 *   2. the resolved pattern makes that weekday non-working,
 *   3. the person held no valid card on that date.
 *
 * The third is the one that is easy to miss and expensive to get wrong. Presence
 * cannot read hire or enrolment dates without closing the domain cycle, so card
 * validity is the window (ADR-0007). A new hire whose card has not been printed
 * yet cannot scan, and counting them absent would record a card-issuance delay
 * as an attendance failure.
 */
@Injectable()
export class DayStatusService {
  constructor(
    private readonly workPatterns: IWorkPatternRepository,
    private readonly credentials: ICredentialRepository,
  ) {}

  async expectation(
    userId: string,
    date: Date,
  ): Promise<{ expected: boolean; pattern: ResolvedPattern }> {
    const pattern = await this.workPatterns.resolveForUserAndDate(userId, date);

    if (!pattern.isWorkingDay) return { expected: false, pattern };
    if (await this.workPatterns.isNonWorkingDay(date)) {
      return { expected: false, pattern };
    }
    if (!(await this.credentials.wasValidOnDate(userId, date))) {
      return { expected: false, pattern };
    }

    return { expected: true, pattern };
  }

  /** On time, late by how much, or simply not a day this person was expected. */
  async judgeArrival(
    userId: string,
    date: Date,
    arrivedAt: Date,
  ): Promise<ArrivalVerdict> {
    const { expected, pattern } = await this.expectation(userId, date);

    if (!expected || !pattern.startTime) {
      return {
        status: 'NOT_EXPECTED',
        lateMinutes: 0,
        workPatternId: pattern.workPatternId,
      };
    }

    const lateBy =
      minutesOfDay(arrivedAt) -
      toMinutes(pattern.startTime) -
      pattern.graceMinutes;

    return {
      status: lateBy > 0 ? 'LATE' : 'PRESENT',
      lateMinutes: Math.max(0, lateBy),
      workPatternId: pattern.workPatternId,
    };
  }

  /** Minutes short of the expected end. Never negative — staying late is not a deficit. */
  async judgeDeparture(
    userId: string,
    date: Date,
    leftAt: Date,
  ): Promise<number> {
    const { expected, pattern } = await this.expectation(userId, date);

    if (!expected || !pattern.endTime) return 0;

    return Math.max(0, toMinutes(pattern.endTime) - minutesOfDay(leftAt));
  }
}
