import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyPresenceSummary } from '../../../presence/daily-record/domain/interfaces/daily-presence-read.port.js';
import {
  AttendanceDriverKey,
  AttendanceDriverService,
} from './attendance-driver.service.js';

const SUMMARY: MonthlyPresenceSummary = {
  userId: 'user-1',
  presentDays: 19,
  absentDays: 1,
  lateCount: 3,
  lateMinutes: 47,
  earlyLeaveCount: 2,
  leaveDays: 4,
  officialDutyDays: 5,
};

describe('AttendanceDriverService', () => {
  let service: AttendanceDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceDriverService],
    }).compile();

    service = module.get(AttendanceDriverService);
  });

  // Every driver maps to a distinct figure. A wrong mapping here pays somebody
  // for the wrong thing, and nothing downstream would notice.
  it.each<[AttendanceDriverKey, number]>([
    ['PRESENT_DAYS', 19],
    ['ABSENT_DAYS', 1],
    ['LATE_COUNT', 3],
    ['LATE_MINUTES', 47],
    ['EARLY_LEAVE_COUNT', 2],
    ['LEAVE_DAYS', 4],
    ['OFFICIAL_DUTY_DAYS', 5],
  ])('maps %s to its own count', (driver, expected) => {
    expect(service.countFor(driver, SUMMARY)).toBe(expected);
  });

  // LATE_COUNT is occurrences, LATE_MINUTES is duration — a deduction per
  // late arrival and a deduction per minute are very different amounts.
  it('keeps late occurrences and late minutes distinct', () => {
    expect(service.countFor('LATE_COUNT', SUMMARY)).not.toBe(
      service.countFor('LATE_MINUTES', SUMMARY),
    );
  });

  describe('an employee with no attendance', () => {
    // FR-054: a defensible figure, not a blank or a crash.
    it('produces a zero summary rather than undefined', () => {
      const blank = service.blank('user-2');

      expect(blank.userId).toBe('user-2');
      expect(Object.values(blank).filter((v) => typeof v === 'number')).toEqual(
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    it('yields zero for every driver', () => {
      const blank = service.blank('user-2');
      const drivers: AttendanceDriverKey[] = [
        'PRESENT_DAYS',
        'ABSENT_DAYS',
        'LATE_COUNT',
        'LATE_MINUTES',
        'EARLY_LEAVE_COUNT',
        'LEAVE_DAYS',
        'OFFICIAL_DUTY_DAYS',
      ];

      for (const driver of drivers) {
        expect(service.countFor(driver, blank)).toBe(0);
      }
    });
  });
});
