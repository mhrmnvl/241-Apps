import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IDailyPresenceRepository } from '../domain/interfaces/daily-presence-repository.interface.js';
import { IPresenceCorrectionRepository } from '../domain/interfaces/presence-correction-repository.interface.js';
import {
  GetDailyPresenceByIdUseCase,
  GetDailyPresencesUseCase,
  GetMyDailyPresencesUseCase,
} from './get-daily-presences.use-case.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('daily presence read use cases', () => {
  let list: GetDailyPresencesUseCase;
  let byId: GetDailyPresenceByIdUseCase;
  let mine: GetMyDailyPresencesUseCase;
  const dailyPresence = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserAndMonth: jest.fn(),
  };
  const corrections = { findByDailyPresence: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDailyPresencesUseCase,
        GetDailyPresenceByIdUseCase,
        GetMyDailyPresencesUseCase,
        { provide: IDailyPresenceRepository, useValue: dailyPresence },
        { provide: IPresenceCorrectionRepository, useValue: corrections },
      ],
    }).compile();

    list = module.get(GetDailyPresencesUseCase);
    byId = module.get(GetDailyPresenceByIdUseCase);
    mine = module.get(GetMyDailyPresencesUseCase);
    jest.clearAllMocks();
    dailyPresence.findAll.mockResolvedValue({
      data: [{ id: 'day-1', corrected: true }],
      total: 1,
      page: 1,
      limit: 50,
    });
    dailyPresence.findById.mockResolvedValue({ id: 'day-1', userId: USER_ID });
    dailyPresence.findByUserAndMonth.mockResolvedValue([{ id: 'day-1' }]);
    corrections.findByDailyPresence.mockResolvedValue([]);
  });

  it('folds the day list into the pagination envelope', async () => {
    const result = await list.execute({ date: new Date('2026-08-10') });

    expect(result.meta.total).toBe(1);
  });

  // FR-014: the screen must be able to say "this value was corrected" without a
  // request per row.
  it('carries the corrected flag through', async () => {
    const result = await list.execute({ date: new Date('2026-08-10') });

    expect(result.data[0].corrected).toBe(true);
  });

  describe('detail', () => {
    it('includes the correction trail so no second call is needed', async () => {
      corrections.findByDailyPresence.mockResolvedValue([
        { field: 'status', reason: 'Hadir, lupa tap' },
      ]);

      const result = await byId.execute('day-1');

      expect(result.corrections).toHaveLength(1);
    });

    it('raises NotFound for an unknown id', async () => {
      dailyPresence.findById.mockResolvedValue(null);

      await expect(byId.execute('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('own record', () => {
    // FR-061. The signature takes the authenticated user, and there is no
    // parameter that could redirect it at somebody else.
    it('reads only the caller’s own month', async () => {
      await mine.execute(USER_ID, 2026, 8);

      expect(dailyPresence.findByUserAndMonth).toHaveBeenCalledWith(
        USER_ID,
        2026,
        8,
      );
    });

    it('returns the period alongside the days', async () => {
      const result = await mine.execute(USER_ID, 2026, 8);

      expect(result).toEqual({
        year: 2026,
        month: 8,
        days: [{ id: 'day-1' }],
      });
    });
  });
});
