import { Test, TestingModule } from '@nestjs/testing';
import { RoundingService } from './rounding.service.js';

describe('RoundingService', () => {
  let service: RoundingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundingService],
    }).compile();

    service = module.get(RoundingService);
  });

  describe('toRupiah', () => {
    it('rounds half up, as Indonesian payroll practice does', () => {
      expect(service.toRupiah('1000.50')).toBe(1001);
      expect(service.toRupiah('1000.49')).toBe(1000);
    });

    it('leaves a whole amount alone', () => {
      expect(service.toRupiah('3500000.00')).toBe(3500000);
    });

    // A component with no amount must not poison the whole payslip with NaN.
    it('treats an unparseable amount as zero rather than NaN', () => {
      expect(service.toRupiah('not-a-number')).toBe(0);
    });
  });

  describe('driven amounts', () => {
    it('multiplies the rate by the count, then rounds once', () => {
      expect(service.driven('150000', 3)).toBe(450000);
    });

    it('rounds a fractional product once, not per step', () => {
      expect(service.driven('1666.67', 3)).toBe(5000);
    });

    it('is zero when the count is zero — nothing happened', () => {
      expect(service.driven('150000', 0)).toBe(0);
    });

    // A driven component with no rate assigned contributes nothing rather than
    // silently multiplying by an implied value.
    it('is zero when no rate is assigned', () => {
      expect(service.driven(null, 5)).toBe(0);
    });
  });

  describe('totals', () => {
    it('separates deductions from everything else', () => {
      const result = service.total([
        { componentType: 'BASE', amount: 3500000 },
        { componentType: 'ALLOWANCE', amount: 500000 },
        { componentType: 'DEDUCTION', amount: 150000 },
      ]);

      expect(result).toEqual({
        gross: 4000000,
        deductions: 150000,
        net: 3850000,
      });
    });

    it('counts an attendance-driven allowance toward gross', () => {
      const result = service.total([
        { componentType: 'ATTENDANCE_DRIVEN', amount: 200000 },
      ]);

      expect(result.gross).toBe(200000);
    });

    // SC-015, the property a payslip is actually judged on: what is listed
    // must add up to what is stated.
    it('reconciles exactly — listed lines sum to the stated net', () => {
      const lines = [
        { componentType: 'BASE', amount: service.toRupiah('3333333.33') },
        { componentType: 'ALLOWANCE', amount: service.toRupiah('333.33') },
        { componentType: 'DEDUCTION', amount: service.toRupiah('166.66') },
      ];

      const { gross, deductions, net } = service.total(lines);
      const listedGross = lines
        .filter((line) => line.componentType !== 'DEDUCTION')
        .reduce((sum, line) => sum + line.amount, 0);
      const listedDeductions = lines
        .filter((line) => line.componentType === 'DEDUCTION')
        .reduce((sum, line) => sum + line.amount, 0);

      expect(listedGross).toBe(gross);
      expect(listedDeductions).toBe(deductions);
      expect(gross - deductions).toBe(net);
    });

    // Rounding the net separately is the specific defect SC-015 tests for:
    // three lines of 333.33 show as 333 each but total 1000.
    it('never leaves a residue between the lines and the net', () => {
      const raw = ['333.33', '333.33', '333.33'];
      const lines = raw.map((amount) => ({
        componentType: 'ALLOWANCE',
        amount: service.toRupiah(amount),
      }));

      const { net } = service.total(lines);
      const naive = service.toRupiah(
        String(raw.reduce((sum, value) => sum + Number(value), 0)),
      );

      expect(net).toBe(999);
      expect(naive).toBe(1000);
      // The two genuinely differ — which is why the order matters.
      expect(net).not.toBe(naive);
    });

    it('handles an employee with no components at all', () => {
      expect(service.total([])).toEqual({ gross: 0, deductions: 0, net: 0 });
    });
  });

  it('formats as a whole-rupiah string, never a float', () => {
    expect(service.format(3500000)).toBe('3500000');
    expect(service.format(0)).toBe('0');
  });
});
