import { Prisma } from '@prisma/client';
import { ComposedPayslip } from '../../domain/entities/payslip.entity.js';

type Tx = Prisma.TransactionClient;

/**
 * Writes a run's payslips and their lines.
 *
 * Lives outside the repository class because the run, its payslips and every
 * line are one indivisible write — a run holding half its people is not a
 * lesser run, it is a wrong one — and that transaction is most of the
 * repository's weight.
 */
export async function writePayslips(
  tx: Tx,
  payrollRunId: string,
  payslips: ComposedPayslip[],
): Promise<void> {
  for (const payslip of payslips) {
    const created = await tx.payslip.create({
      data: {
        payrollRunId,
        userId: payslip.userId,
        grossAmount: payslip.gross,
        deductionAmount: payslip.deductions,
        netAmount: payslip.net,
        ...payslip.attendance,
      },
      select: { id: true },
    });

    if (payslip.lines.length === 0) continue;

    await tx.payslipLine.createMany({
      data: payslip.lines.map((line) => ({
        payslipId: created.id,
        componentId: line.componentId,
        componentCode: line.componentCode,
        componentName: line.componentName,
        componentType: line.componentType,
        amount: line.amount,
        driver: line.driver,
        driverCount: line.driverCount,
        rate: line.rate,
      })),
    });
  }
}

/**
 * Replaces a draft's payslips wholesale.
 *
 * A hard delete, not a soft one: these rows belong to a draft nobody has been
 * paid from, and keeping every superseded attempt would bury the one figure
 * that matters. The lines go with them by cascade.
 */
export async function clearPayslips(
  tx: Tx,
  payrollRunId: string,
): Promise<void> {
  await tx.payslip.deleteMany({ where: { payrollRunId } });
}
