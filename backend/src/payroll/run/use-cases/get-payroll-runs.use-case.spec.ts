import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';
import {
  GetPayrollRunByIdUseCase,
  GetPayrollRunsUseCase,
} from './get-payroll-runs.use-case.js';

describe('Payroll run reads', () => {
  let list: GetPayrollRunsUseCase;
  let byId: GetPayrollRunByIdUseCase;
  const runs = { findAll: jest.fn(), findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPayrollRunsUseCase,
        GetPayrollRunByIdUseCase,
        { provide: IPayrollRunRepository, useValue: runs },
      ],
    }).compile();

    list = module.get(GetPayrollRunsUseCase);
    byId = module.get(GetPayrollRunByIdUseCase);
    jest.clearAllMocks();
  });

  it('passes the year and status filter through', async () => {
    runs.findAll.mockResolvedValue([]);

    await list.execute({ year: 2026, status: 'APPROVED' });

    expect(runs.findAll).toHaveBeenCalledWith({
      year: 2026,
      status: 'APPROVED',
    });
  });

  it('returns a run by id', async () => {
    runs.findById.mockResolvedValue({ id: 'run-1' });

    await expect(byId.execute('run-1')).resolves.toEqual({ id: 'run-1' });
  });

  it('404s rather than returning null', async () => {
    runs.findById.mockResolvedValue(null);

    await expect(byId.execute('run-1')).rejects.toThrow(NotFoundException);
  });
});
