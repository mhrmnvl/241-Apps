import { Test, TestingModule } from '@nestjs/testing';
import { ISalaryAssignmentRepository } from '../../assignment/domain/interfaces/salary-assignment-repository.interface.js';
import { periodEnd, SalaryResolverService } from './salary-resolver.service.js';

function assignment(userId: string, code: string, amount: string) {
  return {
    userId,
    componentId: `comp-${code}`,
    componentCode: code,
    componentName: code,
    componentType: 'BASE',
    driver: null,
    amount,
    rate: null,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('SalaryResolverService', () => {
  let service: SalaryResolverService;
  const assignments = { findEffectiveOn: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryResolverService,
        { provide: ISalaryAssignmentRepository, useValue: assignments },
      ],
    }).compile();

    service = module.get(SalaryResolverService);
    jest.clearAllMocks();
    assignments.findEffectiveOn.mockResolvedValue([
      assignment('user-1', 'GAJI_POKOK', '3500000.00'),
      assignment('user-1', 'TUNJ_JABATAN', '500000.00'),
      assignment('user-2', 'GAJI_POKOK', '3000000.00'),
    ]);
  });

  it('groups the assignments in force by person', async () => {
    const result = await service.resolve(['user-1', 'user-2'], 2026, 8);

    expect(result.get('user-1')).toHaveLength(2);
    expect(result.get('user-2')).toHaveLength(1);
  });

  // Resolved against the period, not today: a run for July must use July's
  // salary even if it is executed in September.
  it('resolves against the last day of the period being run', async () => {
    await service.resolve(['user-1'], 2026, 7);

    expect(assignments.findEffectiveOn).toHaveBeenCalledWith(
      ['user-1'],
      new Date('2026-07-31T00:00:00.000Z'),
    );
  });

  it('handles the last day of a leap February', () => {
    expect(periodEnd(2028, 2).toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('handles December without rolling into the next year', () => {
    expect(periodEnd(2026, 12).toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });

  // Everyone asked for appears, even with nothing in force — otherwise the run
  // would silently skip them rather than refusing.
  it('includes a person with no assignments as an empty entry', async () => {
    const result = await service.resolve(['user-1', 'user-3'], 2026, 8);

    expect(result.get('user-3')).toEqual([]);
  });

  describe('unconfigured employees', () => {
    // A silent zero on a payslip is indistinguishable from a correct figure,
    // and the person finds out on payday.
    it('names everyone with nothing to be paid by', async () => {
      const result = await service.resolve(
        ['user-1', 'user-3', 'user-4'],
        2026,
        8,
      );

      expect(service.unconfigured(result)).toEqual(['user-3', 'user-4']);
    });

    it('is empty when everyone is configured', async () => {
      const result = await service.resolve(['user-1', 'user-2'], 2026, 8);

      expect(service.unconfigured(result)).toEqual([]);
    });
  });

  it('asks for nothing when there is nobody to pay', async () => {
    assignments.findEffectiveOn.mockResolvedValue([]);

    const result = await service.resolve([], 2026, 8);

    expect(result.size).toBe(0);
  });
});
