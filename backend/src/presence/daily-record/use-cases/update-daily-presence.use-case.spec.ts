import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAttendancePeriodRepository } from '../../attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { IDailyPresenceRepository } from '../domain/interfaces/daily-presence-repository.interface.js';
import { IPresenceCorrectionRepository } from '../domain/interfaces/presence-correction-repository.interface.js';
import { PresenceAuditService } from '../services/presence-audit.service.js';
import { UpdateDailyPresenceUseCase } from './update-daily-presence.use-case.js';

const ACTOR_ID = '22222222-2222-4222-8222-222222222222';
const SUBJECT_ID = '11111111-1111-4111-8111-111111111111';

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: 'day-1',
    userId: SUBJECT_ID,
    subjectType: 'EMPLOYEE',
    date: new Date('2026-08-10T00:00:00.000Z'),
    checkInAt: new Date('2026-08-10T07:20:00.000Z'),
    checkOutAt: null,
    status: 'LATE',
    note: null,
    lateMinutes: 10,
    ...overrides,
  };
}

describe('UpdateDailyPresenceUseCase', () => {
  let useCase: UpdateDailyPresenceUseCase;
  const dailyPresence = { findById: jest.fn(), correct: jest.fn() };
  const corrections = { recordMany: jest.fn() };
  const periods = { isClosed: jest.fn() };
  const audit = { record: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDailyPresenceUseCase,
        { provide: IDailyPresenceRepository, useValue: dailyPresence },
        { provide: IPresenceCorrectionRepository, useValue: corrections },
        { provide: IAttendancePeriodRepository, useValue: periods },
        { provide: PresenceAuditService, useValue: audit },
      ],
    }).compile();

    useCase = module.get(UpdateDailyPresenceUseCase);
    jest.clearAllMocks();
    dailyPresence.findById.mockResolvedValue(record());
    dailyPresence.correct.mockResolvedValue(record({ status: 'PRESENT' }));
    periods.isClosed.mockResolvedValue(false);
  });

  it('applies the change and returns the corrected record', async () => {
    const result = await useCase.execute(
      'day-1',
      { status: 'PRESENT', reason: 'Hadir, lupa tap' },
      ACTOR_ID,
    );

    expect(dailyPresence.correct).toHaveBeenCalledWith('day-1', {
      status: 'PRESENT',
    });
    expect(result.status).toBe('PRESENT');
  });

  // FR-015. A permission cannot express "anyone but yourself", so this has to
  // live in the use case — holding presence-records.update is not enough.
  it('refuses an actor editing their own record', async () => {
    dailyPresence.findById.mockResolvedValue(record({ userId: ACTOR_ID }));

    await expect(
      useCase.execute('day-1', { status: 'PRESENT', reason: 'x' }, ACTOR_ID),
    ).rejects.toThrow(ForbiddenException);

    expect(dailyPresence.correct).not.toHaveBeenCalled();
  });

  // Closing a month is what fixes payroll's inputs; a later edit would move
  // money that has already been approved.
  it('refuses an edit inside a closed period', async () => {
    periods.isClosed.mockResolvedValue(true);

    await expect(
      useCase.execute('day-1', { status: 'PRESENT', reason: 'x' }, ACTOR_ID),
    ).rejects.toThrow(ConflictException);

    expect(dailyPresence.correct).not.toHaveBeenCalled();
  });

  it('checks the period of the record, not of today', async () => {
    await useCase.execute(
      'day-1',
      { status: 'PRESENT', reason: 'x' },
      ACTOR_ID,
    );

    expect(periods.isClosed).toHaveBeenCalledWith(2026, 8);
  });

  it('raises NotFound for an unknown record', async () => {
    dailyPresence.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { status: 'PRESENT', reason: 'x' }, ACTOR_ID),
    ).rejects.toThrow(NotFoundException);
  });

  describe('the correction trail', () => {
    it('writes one row per field that actually moved', async () => {
      await useCase.execute(
        'day-1',
        {
          status: 'PRESENT',
          checkInAt: '2026-08-10T07:00:00.000Z',
          reason: 'Hadir tepat waktu, mesin error',
        },
        ACTOR_ID,
      );

      const [rows] = corrections.recordMany.mock.calls[0] as [
        { field: string }[],
      ];
      expect(rows.map((row) => row.field).sort()).toEqual([
        'checkInAt',
        'status',
      ]);
    });

    // Sending a field unchanged is not a correction. Recording it would bury
    // the real edits in noise on the trail the TU screen renders.
    it('ignores a field sent with the value it already had', async () => {
      await useCase.execute(
        'day-1',
        { status: 'LATE', note: 'catatan baru', reason: 'x' },
        ACTOR_ID,
      );

      const [rows] = corrections.recordMany.mock.calls[0] as [
        { field: string }[],
      ];
      expect(rows.map((row) => row.field)).toEqual(['note']);
    });

    it('captures the previous and new value, the actor, and the reason', async () => {
      await useCase.execute(
        'day-1',
        { status: 'PRESENT', reason: 'Hadir, lupa tap' },
        ACTOR_ID,
      );

      const [rows] = corrections.recordMany.mock.calls[0] as [
        Record<string, unknown>[],
      ];
      expect(rows[0]).toEqual({
        dailyPresenceId: 'day-1',
        field: 'status',
        previousValue: 'LATE',
        newValue: 'PRESENT',
        reason: 'Hadir, lupa tap',
        actorId: ACTOR_ID,
      });
    });

    it('refuses a request that changes nothing', async () => {
      await expect(
        useCase.execute('day-1', { status: 'LATE', reason: 'x' }, ACTOR_ID),
      ).rejects.toThrow(BadRequestException);

      expect(corrections.recordMany).not.toHaveBeenCalled();
    });
  });

  it('writes an audit row naming the subject, the date, and the reason', async () => {
    await useCase.execute(
      'day-1',
      { status: 'PRESENT', reason: 'Hadir, lupa tap' },
      ACTOR_ID,
    );

    expect(audit.record).toHaveBeenCalledWith(
      'presence-record.correct',
      'day-1',
      ACTOR_ID,
      {
        subjectUserId: SUBJECT_ID,
        date: '2026-08-10',
        reason: 'Hadir, lupa tap',
      },
    );
  });
});
