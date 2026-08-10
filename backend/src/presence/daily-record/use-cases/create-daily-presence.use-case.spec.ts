import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAttendancePeriodRepository } from '../../attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { IWorkPatternRepository } from '../../work-pattern/domain/interfaces/work-pattern-repository.interface.js';
import { IDailyPresenceRepository } from '../domain/interfaces/daily-presence-repository.interface.js';
import { PresenceAuditService } from '../services/presence-audit.service.js';
import { CreateDailyPresenceUseCase } from './create-daily-presence.use-case.js';

const ACTOR_ID = '22222222-2222-4222-8222-222222222222';
const USER_ID = '11111111-1111-4111-8111-111111111111';

function dto(overrides: Record<string, unknown> = {}) {
  return {
    userId: USER_ID,
    subjectType: 'EMPLOYEE' as const,
    date: '2026-08-10',
    status: 'PRESENT' as const,
    reason: 'Lupa membawa kartu',
    ...overrides,
  };
}

describe('CreateDailyPresenceUseCase', () => {
  let useCase: CreateDailyPresenceUseCase;
  const dailyPresence = {
    findByUserAndDate: jest.fn(),
    createManual: jest.fn(),
  };
  const workPatterns = { resolveForUserAndDate: jest.fn() };
  const periods = { isClosed: jest.fn() };
  const audit = { record: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDailyPresenceUseCase,
        { provide: IDailyPresenceRepository, useValue: dailyPresence },
        { provide: IWorkPatternRepository, useValue: workPatterns },
        { provide: IAttendancePeriodRepository, useValue: periods },
        { provide: PresenceAuditService, useValue: audit },
      ],
    }).compile();

    useCase = module.get(CreateDailyPresenceUseCase);
    jest.clearAllMocks();
    dailyPresence.findByUserAndDate.mockResolvedValue(null);
    dailyPresence.createManual.mockResolvedValue({ id: 'day-1' });
    workPatterns.resolveForUserAndDate.mockResolvedValue({
      workPatternId: 'pattern-1',
    });
    periods.isClosed.mockResolvedValue(false);
  });

  it('records the day with the asserted status', async () => {
    await useCase.execute(dto(), ACTOR_ID);

    expect(dailyPresence.createManual).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        status: 'PRESENT',
        workPatternId: 'pattern-1',
      }),
    );
  });

  it('normalises the date to midnight so it matches the one-per-day index', async () => {
    await useCase.execute(dto({ date: '2026-08-10T13:45:00.000Z' }), ACTOR_ID);

    const [input] = dailyPresence.createManual.mock.calls[0] as [
      { date: Date },
    ];
    expect(input.date.toISOString()).toBe('2026-08-10T00:00:00.000Z');
  });

  // A second row for the same person and date would break the partial unique
  // index, and correcting is the right action anyway.
  it('refuses when a record already exists for that date', async () => {
    dailyPresence.findByUserAndDate.mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute(dto(), ACTOR_ID)).rejects.toThrow(
      ConflictException,
    );
    expect(dailyPresence.createManual).not.toHaveBeenCalled();
  });

  it('points the operator at correcting rather than just refusing', async () => {
    dailyPresence.findByUserAndDate.mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute(dto(), ACTOR_ID)).rejects.toThrow(
      /Correct it/,
    );
  });

  it('refuses inside a closed period', async () => {
    periods.isClosed.mockResolvedValue(true);

    await expect(useCase.execute(dto(), ACTOR_ID)).rejects.toThrow(
      ConflictException,
    );
    expect(dailyPresence.createManual).not.toHaveBeenCalled();
  });

  it('writes an audit row naming the subject and the reason', async () => {
    await useCase.execute(dto(), ACTOR_ID);

    expect(audit.record).toHaveBeenCalledWith(
      'presence-record.create',
      'day-1',
      ACTOR_ID,
      {
        subjectUserId: USER_ID,
        date: '2026-08-10',
        reason: 'Lupa membawa kartu',
      },
    );
  });
});
