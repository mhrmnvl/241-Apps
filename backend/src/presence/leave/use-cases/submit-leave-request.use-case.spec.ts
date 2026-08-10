import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import { WorkingDayExpanderService } from '../services/working-day-expander.service.js';
import { SubmitLeaveRequestUseCase } from './submit-leave-request.use-case.js';

const REQUESTER = '11111111-1111-4111-8111-111111111111';

const IZIN = {
  id: 'type-1',
  name: 'Izin',
  isActive: true,
  requiresDocument: false,
};

function dto(overrides: Record<string, unknown> = {}) {
  return {
    leaveTypeId: 'type-1',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    reason: 'Keperluan keluarga',
    ...overrides,
  };
}

describe('SubmitLeaveRequestUseCase', () => {
  let useCase: SubmitLeaveRequestUseCase;
  const leave = { findTypeById: jest.fn(), submit: jest.fn() };
  const expander = { expand: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitLeaveRequestUseCase,
        { provide: ILeaveRepository, useValue: leave },
        { provide: WorkingDayExpanderService, useValue: expander },
      ],
    }).compile();

    useCase = module.get(SubmitLeaveRequestUseCase);
    jest.clearAllMocks();
    leave.findTypeById.mockResolvedValue(IZIN);
    leave.submit.mockImplementation((input: unknown) => input);
    expander.expand.mockResolvedValue([
      new Date('2026-09-01T00:00:00.000Z'),
      new Date('2026-09-02T00:00:00.000Z'),
    ]);
  });

  it('materialises the covered days at submission', async () => {
    await useCase.execute(dto(), REQUESTER);

    expect(leave.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterId: REQUESTER,
        workingDayCount: 2,
        days: [
          new Date('2026-09-01T00:00:00.000Z'),
          new Date('2026-09-02T00:00:00.000Z'),
        ],
      }),
    );
  });

  // FR-032: a request spanning a weekend consumes less quota than its calendar
  // length suggests, because only working days are recorded.
  it('counts only working days, not calendar days', async () => {
    expander.expand.mockResolvedValue([new Date('2026-09-01T00:00:00.000Z')]);

    await useCase.execute(
      dto({ startDate: '2026-09-01', endDate: '2026-09-06' }),
      REQUESTER,
    );

    expect(leave.submit).toHaveBeenCalledWith(
      expect.objectContaining({ workingDayCount: 1 }),
    );
  });

  it('refuses a range containing no working days at all', async () => {
    expander.expand.mockResolvedValue([]);

    await expect(useCase.execute(dto(), REQUESTER)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(leave.submit).not.toHaveBeenCalled();
  });

  it('refuses an end date before the start date', async () => {
    await expect(
      useCase.execute(
        dto({ startDate: '2026-09-05', endDate: '2026-09-01' }),
        REQUESTER,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuses a type that requires a document without one', async () => {
    leave.findTypeById.mockResolvedValue({ ...IZIN, requiresDocument: true });

    await expect(useCase.execute(dto(), REQUESTER)).rejects.toThrow(
      /requires a supporting document/,
    );
  });

  it('accepts a document-requiring type when one is attached', async () => {
    leave.findTypeById.mockResolvedValue({ ...IZIN, requiresDocument: true });

    await expect(
      useCase.execute(dto({ documentFileId: 'file-1' }), REQUESTER),
    ).resolves.toBeDefined();
  });

  it('refuses a deactivated leave type', async () => {
    leave.findTypeById.mockResolvedValue({ ...IZIN, isActive: false });

    await expect(useCase.execute(dto(), REQUESTER)).rejects.toThrow(
      /not found/,
    );
  });

  it('normalises the dates to midnight so they match the day index', async () => {
    await useCase.execute(
      dto({ startDate: '2026-09-01T13:45:00.000Z' }),
      REQUESTER,
    );

    const [input] = leave.submit.mock.calls[0] as [{ startDate: Date }];
    expect(input.startDate.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  // The requester comes from the session, never the payload — otherwise anyone
  // could file leave in somebody else's name.
  it('takes the requester from the session rather than the body', async () => {
    await useCase.execute(dto({ requesterId: 'somebody-else' }), REQUESTER);

    expect(leave.submit).toHaveBeenCalledWith(
      expect.objectContaining({ requesterId: REQUESTER }),
    );
  });
});
