import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IWorkPatternRepository } from '../domain/interfaces/work-pattern-repository.interface.js';
import {
  CreateWorkPatternUseCase,
  DeleteWorkPatternUseCase,
  ReplaceWorkPatternDaysUseCase,
  UpdateWorkPatternUseCase,
} from './manage-work-pattern.use-case.js';

const STANDARD = {
  id: 'pattern-1',
  name: 'Standar',
  isDefault: true,
  graceMinutes: 10,
  days: [],
};
const PIKET = {
  id: 'pattern-2',
  name: 'Piket',
  isDefault: false,
  graceMinutes: 0,
  days: [],
};

/** A complete, valid week. */
function fullWeek(overrides: Record<number, Record<string, unknown>> = {}) {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    isWorkingDay: weekday !== 0,
    startTime: '07:00',
    endTime: '14:00',
    ...overrides[weekday],
  }));
}

describe('work pattern management', () => {
  let create: CreateWorkPatternUseCase;
  let update: UpdateWorkPatternUseCase;
  let remove: DeleteWorkPatternUseCase;
  let replaceDays: ReplaceWorkPatternDaysUseCase;
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    replaceDays: jest.fn(),
    countAssignments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWorkPatternUseCase,
        UpdateWorkPatternUseCase,
        DeleteWorkPatternUseCase,
        ReplaceWorkPatternDaysUseCase,
        { provide: IWorkPatternRepository, useValue: repository },
      ],
    }).compile();

    create = module.get(CreateWorkPatternUseCase);
    update = module.get(UpdateWorkPatternUseCase);
    remove = module.get(DeleteWorkPatternUseCase);
    replaceDays = module.get(ReplaceWorkPatternDaysUseCase);
    jest.clearAllMocks();
    repository.findAll.mockResolvedValue([STANDARD, PIKET]);
    repository.findById.mockResolvedValue(PIKET);
    repository.countAssignments.mockResolvedValue(0);
    repository.replaceDays.mockImplementation((_id, days: unknown) => days);
  });

  describe('creating', () => {
    it('creates an ordinary pattern', async () => {
      await create.execute({ name: 'Ramadan', graceMinutes: 5 });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Ramadan',
        graceMinutes: 5,
        isDefault: false,
      });
    });

    // Two defaults would make "which pattern applies to somebody with no
    // assignment" ambiguous — and the partial unique index rejects it anyway.
    it('refuses a second default, naming the one already holding it', async () => {
      await expect(
        create.execute({ name: 'Ramadan', graceMinutes: 5, isDefault: true }),
      ).rejects.toThrow(/Standar/);
    });
  });

  describe('updating', () => {
    it('refuses an unknown pattern', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(update.execute('missing', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('refuses taking the default from another pattern', async () => {
      await expect(
        update.execute('pattern-2', { isDefault: true }),
      ).rejects.toThrow(ConflictException);
    });

    // FR-027. The guarantee lives in the data model — DailyPresence stores the
    // pattern it was judged against — so editing here must not reach back into
    // recorded days at all.
    it('never recomputes recorded days', async () => {
      await update.execute('pattern-2', { graceMinutes: 20 });

      expect(repository.update).toHaveBeenCalledWith('pattern-2', {
        graceMinutes: 20,
      });
      // No recompute, no cascade, nothing that could move a closed month.
      expect(repository.replaceDays).not.toHaveBeenCalled();
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    // Removing the default leaves everyone unassigned judged against nothing,
    // and every scan resolves to NOT_EXPECTED.
    it('refuses to remove the default pattern', async () => {
      repository.findById.mockResolvedValue(STANDARD);

      await expect(remove.execute('pattern-1')).rejects.toThrow(
        /default pattern cannot be removed/,
      );
    });

    it('refuses while employees are still assigned', async () => {
      repository.countAssignments.mockResolvedValue(3);

      await expect(remove.execute('pattern-2')).rejects.toThrow(/3 employee/);
    });

    it('soft-deletes an unused, non-default pattern', async () => {
      await remove.execute('pattern-2');

      expect(repository.softDelete).toHaveBeenCalledWith('pattern-2');
    });
  });

  describe('replacing the week', () => {
    it('writes all seven days', async () => {
      await replaceDays.execute('pattern-2', { days: fullWeek() });

      expect(repository.replaceDays).toHaveBeenCalledWith(
        'pattern-2',
        expect.arrayContaining([expect.objectContaining({ weekday: 5 })]),
      );
    });

    // A partial update could leave a pattern with no Friday, which resolves to
    // "not a working day" for everyone assigned — a silent change to who counts
    // as absent.
    it('refuses a partial week', async () => {
      const missingFriday = fullWeek().filter((day) => day.weekday !== 5);

      await expect(
        replaceDays.execute('pattern-2', { days: missingFriday }),
      ).rejects.toThrow(/all seven weekdays/);
    });

    it('refuses a duplicated weekday', async () => {
      const days = fullWeek();
      days[6] = { ...days[5] };

      await expect(replaceDays.execute('pattern-2', { days })).rejects.toThrow(
        ConflictException,
      );
    });

    it('refuses an end time at or before the start time', async () => {
      const days = fullWeek({ 1: { startTime: '14:00', endTime: '07:00' } });

      await expect(replaceDays.execute('pattern-2', { days })).rejects.toThrow(
        /end time must be after/,
      );
    });

    // A non-working day carries placeholder times nobody is judged against.
    it('ignores the times on a non-working day', async () => {
      const days = fullWeek({
        0: { isWorkingDay: false, startTime: '14:00', endTime: '07:00' },
      });

      await expect(
        replaceDays.execute('pattern-2', { days }),
      ).resolves.toBeDefined();
    });
  });
});
