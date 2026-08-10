import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IAttendancePeriodRepository } from '../domain/interfaces/attendance-period-repository.interface.js';
import { CloseAttendancePeriodUseCase } from './close-attendance-period.use-case.js';

const ACTOR_ID = '22222222-2222-4222-8222-222222222222';

function incomplete(userId: string, name: string) {
  return {
    userId,
    date: new Date('2026-08-12T00:00:00.000Z'),
    user: { profile: { name } },
  };
}

describe('CloseAttendancePeriodUseCase', () => {
  let useCase: CloseAttendancePeriodUseCase;
  const periods = {
    findByPeriod: jest.fn(),
    close: jest.fn(),
    isClosed: jest.fn(),
    findAll: jest.fn(),
  };
  const prisma = { dailyPresence: { findMany: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloseAttendancePeriodUseCase,
        { provide: IAttendancePeriodRepository, useValue: periods },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    useCase = module.get(CloseAttendancePeriodUseCase);
    jest.clearAllMocks();
    periods.findByPeriod.mockResolvedValue(null);
    prisma.dailyPresence.findMany.mockResolvedValue([]);
  });

  it('closes a complete month', async () => {
    await useCase.execute(2026, 8, ACTOR_ID);

    expect(periods.close).toHaveBeenCalledWith({
      year: 2026,
      month: 8,
      closedBy: ACTOR_ID,
      closedAt: expect.any(Date),
    });
  });

  it('refuses a month that is already closed', async () => {
    periods.findByPeriod.mockResolvedValue({ status: 'CLOSED' });

    await expect(useCase.execute(2026, 8, ACTOR_ID)).rejects.toThrow(
      ConflictException,
    );
    expect(periods.close).not.toHaveBeenCalled();
  });

  // Closing is what fixes payroll's inputs, and an approved run cannot be
  // edited afterwards. A day with an arrival and no departure is unresolved
  // ambiguity, and closing over it carries that straight into a payslip.
  describe('incomplete records', () => {
    it('refuses to close while any day lacks a check-out', async () => {
      prisma.dailyPresence.findMany.mockResolvedValue([
        incomplete('user-1', 'Ahmad'),
      ]);

      await expect(useCase.execute(2026, 8, ACTOR_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(periods.close).not.toHaveBeenCalled();
    });

    it('names who and when, so the refusal is actionable', async () => {
      prisma.dailyPresence.findMany.mockResolvedValue([
        incomplete('user-1', 'Ahmad'),
      ]);

      await expect(useCase.execute(2026, 8, ACTOR_ID)).rejects.toMatchObject({
        response: {
          incomplete: [
            { userId: 'user-1', displayName: 'Ahmad', date: '2026-08-12' },
          ],
          total: 1,
        },
      });
    });

    it('caps the list but reports the true total', async () => {
      prisma.dailyPresence.findMany.mockResolvedValue(
        Array.from({ length: 25 }, (_, i) => incomplete(`user-${i}`, `P${i}`)),
      );

      await expect(useCase.execute(2026, 8, ACTOR_ID)).rejects.toMatchObject({
        response: { total: 25 },
      });
    });

    // ABSENT, ON_LEAVE and NOT_EXPECTED have no check-out by definition —
    // demanding one would make a month containing a single holiday impossible
    // to close.
    it('only considers days somebody actually attended', async () => {
      await useCase.execute(2026, 8, ACTOR_ID);

      const [args] = prisma.dailyPresence.findMany.mock.calls[0] as [
        { where: { status: { in: string[] } } },
      ];
      expect(args.where.status.in).toEqual(['PRESENT', 'LATE']);
    });

    it('scans exactly the month being closed', async () => {
      await useCase.execute(2026, 8, ACTOR_ID);

      const [args] = prisma.dailyPresence.findMany.mock.calls[0] as [
        { where: { date: { gte: Date; lte: Date } } },
      ];
      expect(args.where.date.gte.toISOString()).toBe(
        '2026-08-01T00:00:00.000Z',
      );
      expect(args.where.date.lte.toISOString()).toBe(
        '2026-08-31T23:59:59.999Z',
      );
    });
  });
});
