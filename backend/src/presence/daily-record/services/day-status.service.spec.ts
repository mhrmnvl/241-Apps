import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import { IWorkPatternRepository } from '../../work-pattern/domain/interfaces/work-pattern-repository.interface.js';
import { DayStatusService } from './day-status.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const MONDAY = new Date('2026-08-10T00:00:00.000Z');

/** Mon–Thu & Sat 07:00–14:00 with a 10-minute grace, the seeded default. */
const STANDARD = {
  workPatternId: 'pattern-1',
  patternName: 'Standar',
  isWorkingDay: true,
  startTime: '07:00',
  endTime: '14:00',
  graceMinutes: 10,
};

function at(time: string): Date {
  return new Date(`2026-08-10T${time}:00.000Z`);
}

describe('DayStatusService', () => {
  let service: DayStatusService;
  const workPatterns = {
    resolveForUserAndDate: jest.fn(),
    isNonWorkingDay: jest.fn(),
  };
  const credentials = { wasValidOnDate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DayStatusService,
        { provide: IWorkPatternRepository, useValue: workPatterns },
        { provide: ICredentialRepository, useValue: credentials },
      ],
    }).compile();

    service = module.get(DayStatusService);
    jest.clearAllMocks();
    workPatterns.resolveForUserAndDate.mockResolvedValue(STANDARD);
    workPatterns.isNonWorkingDay.mockResolvedValue(false);
    credentials.wasValidOnDate.mockResolvedValue(true);
  });

  describe('arrival', () => {
    it('is PRESENT when inside the start time', async () => {
      await expect(
        service.judgeArrival(USER_ID, MONDAY, at('06:55')),
      ).resolves.toEqual({
        status: 'PRESENT',
        lateMinutes: 0,
        workPatternId: 'pattern-1',
      });
    });

    // FR-025: the grace period is real, not decorative.
    it('is PRESENT inside the grace period', async () => {
      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:09'));

      expect(verdict.status).toBe('PRESENT');
      expect(verdict.lateMinutes).toBe(0);
    });

    it('is PRESENT exactly at the end of the grace period', async () => {
      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:10'));

      expect(verdict.status).toBe('PRESENT');
    });

    // FR-025 measures lateness as minutes *beyond the grace*, not beyond the
    // start time. Arriving 07:25 against a 07:00 start with 10 minutes grace is
    // 15 late, not 25 — the distinction is the whole reason grace exists.
    it('counts lateness from beyond the grace, not from the start time', async () => {
      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:25'));

      expect(verdict.status).toBe('LATE');
      expect(verdict.lateMinutes).toBe(15);
    });

    it('is one minute late the minute after grace expires', async () => {
      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:11'));

      expect(verdict.lateMinutes).toBe(1);
    });

    // Recording which pattern judged the day is what makes FR-027 possible.
    it('records the pattern it judged against', async () => {
      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('08:00'));

      expect(verdict.workPatternId).toBe('pattern-1');
    });
  });

  // FR-011. All three causes, because missing one turns a non-day into an
  // absence and, once payroll is attached, into a deduction.
  describe('NOT_EXPECTED — the three causes', () => {
    it('1. the weekday is non-working in the resolved pattern', async () => {
      workPatterns.resolveForUserAndDate.mockResolvedValue({
        ...STANDARD,
        isWorkingDay: false,
      });

      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:00'));

      expect(verdict.status).toBe('NOT_EXPECTED');
    });

    it('2. the date is a holiday', async () => {
      workPatterns.isNonWorkingDay.mockResolvedValue(true);

      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:00'));

      expect(verdict.status).toBe('NOT_EXPECTED');
    });

    // The one that is easy to miss: a new hire whose card is not printed yet
    // must not read as absent every day until it is.
    it('3. the person held no valid card on that date', async () => {
      credentials.wasValidOnDate.mockResolvedValue(false);

      const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:00'));

      expect(verdict.status).toBe('NOT_EXPECTED');
      expect(verdict.lateMinutes).toBe(0);
    });

    it('checks card validity even when the pattern and calendar both say working', async () => {
      credentials.wasValidOnDate.mockResolvedValue(false);

      await service.expectation(USER_ID, MONDAY);

      expect(credentials.wasValidOnDate).toHaveBeenCalledWith(USER_ID, MONDAY);
    });

    it('is expected only when all three checks pass', async () => {
      await expect(service.expectation(USER_ID, MONDAY)).resolves.toEqual(
        expect.objectContaining({ expected: true }),
      );
    });
  });

  describe('departure', () => {
    it('is zero when leaving at or after the expected end', async () => {
      await expect(
        service.judgeDeparture(USER_ID, MONDAY, at('14:00')),
      ).resolves.toBe(0);
    });

    // Staying late is not a deficit; the figure must never go negative.
    it('is zero when leaving well after the expected end', async () => {
      await expect(
        service.judgeDeparture(USER_ID, MONDAY, at('16:30')),
      ).resolves.toBe(0);
    });

    it('counts the minutes short when leaving early', async () => {
      await expect(
        service.judgeDeparture(USER_ID, MONDAY, at('13:30')),
      ).resolves.toBe(30);
    });

    it('is zero on a day the person was not expected', async () => {
      workPatterns.isNonWorkingDay.mockResolvedValue(true);

      await expect(
        service.judgeDeparture(USER_ID, MONDAY, at('10:00')),
      ).resolves.toBe(0);
    });
  });

  // A fresh install before the seed runs must not crash the gate.
  it('treats a missing pattern as not expected rather than throwing', async () => {
    workPatterns.resolveForUserAndDate.mockResolvedValue({
      workPatternId: null,
      patternName: null,
      isWorkingDay: true,
      startTime: null,
      endTime: null,
      graceMinutes: 0,
    });

    const verdict = await service.judgeArrival(USER_ID, MONDAY, at('07:00'));

    expect(verdict.status).toBe('NOT_EXPECTED');
  });
});
