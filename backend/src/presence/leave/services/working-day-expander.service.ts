import { Injectable } from '@nestjs/common';
import { IWorkPatternRepository } from '../../work-pattern/domain/interfaces/work-pattern-repository.interface.js';

@Injectable()
export class WorkingDayExpanderService {
  constructor(private readonly workPatterns: IWorkPatternRepository) {}

  /**
   * The working days a date range actually covers, for this person.
   *
   * Resolved **once, at submission**, and stored as `LeaveDay` rows. That is
   * deliberate: if the days were recomputed on read, changing the work pattern
   * or adding a holiday in November could retroactively alter a leave request
   * approved in August — and with it the quota it consumed and the payslip it
   * fed (FR-027).
   *
   * A weekend or a holiday inside the range consumes no quota and is not marked
   * as leave, because the person was not expected on it anyway.
   */
  async expand(userId: string, start: Date, end: Date): Promise<Date[]> {
    const days: Date[] = [];

    for (
      const cursor = new Date(start);
      cursor <= end;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const date = new Date(cursor);
      const pattern = await this.workPatterns.resolveForUserAndDate(
        userId,
        date,
      );

      if (!pattern.isWorkingDay) continue;
      if (await this.workPatterns.isNonWorkingDay(date)) continue;

      days.push(date);
    }

    return days;
  }
}
