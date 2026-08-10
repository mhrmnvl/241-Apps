import { Test, TestingModule } from '@nestjs/testing';
import { ServerClockService } from '../../shared/services/server-clock.service.js';
import { IScanRepository } from '../domain/interfaces/scan-repository.interface.js';
import {
  GetClockAnchorUseCase,
  GetScansUseCase,
} from './get-scans.use-case.js';

describe('GetScansUseCase', () => {
  let list: GetScansUseCase;
  let anchor: GetClockAnchorUseCase;
  const scans = { findAll: jest.fn() };
  const clock = { issueAnchor: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetScansUseCase,
        GetClockAnchorUseCase,
        { provide: IScanRepository, useValue: scans },
        { provide: ServerClockService, useValue: clock },
      ],
    }).compile();

    list = module.get(GetScansUseCase);
    anchor = module.get(GetClockAnchorUseCase);
    jest.clearAllMocks();
    scans.findAll.mockResolvedValue({
      data: [{ id: 'scan-1', outcome: 'REJECTED_UNKNOWN' }],
      total: 1,
      page: 1,
      limit: 20,
    });
    clock.issueAnchor.mockReturnValue({
      serverTime: new Date('2026-08-10T07:00:00.000Z'),
      anchorId: 'anchor-1',
      maxOfflineWindowHours: 8,
    });
  });

  it('folds the log into the pagination envelope', async () => {
    const result = await list.execute({});

    expect(result.meta).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  // FR-003: the log is evidence, and a rejected attempt is the interesting kind.
  it('includes rejected attempts', async () => {
    const result = await list.execute({ outcome: 'REJECTED_UNKNOWN' });

    expect(result.data[0].outcome).toBe('REJECTED_UNKNOWN');
    expect(scans.findAll).toHaveBeenCalledWith({
      outcome: 'REJECTED_UNKNOWN',
    });
  });

  it('hands the device a clock anchor and the window it must respect', () => {
    expect(anchor.execute()).toEqual({
      serverTime: expect.any(Date),
      anchorId: 'anchor-1',
      maxOfflineWindowHours: 8,
    });
  });
});
