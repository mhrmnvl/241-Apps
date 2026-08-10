import { Test, TestingModule } from '@nestjs/testing';
import { IAttendancePeriodRepository } from '../domain/interfaces/attendance-period-repository.interface.js';
import { GetAttendancePeriodsUseCase } from './get-attendance-periods.use-case.js';

function period(overrides: Record<string, unknown> = {}) {
  return {
    id: 'period-1',
    year: 2026,
    month: 7,
    status: 'CLOSED',
    closedAt: new Date('2026-08-01T00:00:00.000Z'),
    closedBy: 'user-1',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('GetAttendancePeriodsUseCase', () => {
  let useCase: GetAttendancePeriodsUseCase;
  const repository = {
    findAll: jest.fn(),
    findByPeriod: jest.fn(),
    isClosed: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAttendancePeriodsUseCase,
        { provide: IAttendancePeriodRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetAttendancePeriodsUseCase);
    jest.clearAllMocks();
    repository.findAll.mockResolvedValue([period()]);
  });

  it('returns the periods the repository reports', async () => {
    await expect(useCase.execute({})).resolves.toEqual([period()]);
  });

  it('passes the year and status filters straight through', async () => {
    await useCase.execute({ year: 2026, status: 'CLOSED' });

    expect(repository.findAll).toHaveBeenCalledWith({
      year: 2026,
      status: 'CLOSED',
    });
  });

  // A school in its first month has closed nothing; the screen must render an
  // empty list rather than treat it as an error.
  it('returns an empty list when nothing has been closed yet', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(useCase.execute({})).resolves.toEqual([]);
  });
});
