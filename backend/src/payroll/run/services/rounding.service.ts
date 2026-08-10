import { Injectable } from '@nestjs/common';

/**
 * Whole-rupiah arithmetic for payroll.
 *
 * Rounding happens **per line, then the lines are summed** — never the other
 * way round. That ordering is the whole of SC-015: three lines of Rp 333,33
 * displayed as Rp 333 each would sit under a total of Rp 1.000 if the net were
 * rounded separately, and a payslip whose numbers do not add up is one nobody
 * can defend.
 *
 * Values move as strings because JSON numbers are IEEE-754 doubles, and a
 * salary is the last place to accept that.
 */
@Injectable()
export class RoundingService {
  /** Half-up to whole rupiah — what Indonesian payroll practice does. */
  toRupiah(value: string | number): number {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) return 0;

    // Math.round is half-up for positives but half-away-from-zero for
    // negatives; a deduction is stored positive, so sign never reaches here.
    return Math.round(numeric);
  }

  /** `rate × count`, rounded once. */
  driven(rate: string | null, count: number): number {
    if (rate === null) return 0;
    return this.toRupiah(Number(rate) * count);
  }

  /**
   * Sums already-rounded lines into gross, deductions and net.
   *
   * Takes rounded integers on purpose: passing unrounded values here is what
   * would reintroduce the residue this service exists to prevent.
   */
  total(lines: { componentType: string; amount: number }[]): {
    gross: number;
    deductions: number;
    net: number;
  } {
    let gross = 0;
    let deductions = 0;

    for (const line of lines) {
      if (line.componentType === 'DEDUCTION') {
        deductions += line.amount;
      } else {
        gross += line.amount;
      }
    }

    return { gross, deductions, net: gross - deductions };
  }

  /** Whole rupiah as a string, for a response DTO. */
  format(value: number): string {
    return String(Math.round(value));
  }
}
