import { Prisma } from '@prisma/client';

/**
 * What it means to move asset units and record why, in one place.
 *
 * Four paths reach this: a loan approved through the workflow, a loan approved
 * automatically at creation, a loan rejected, and a loan returned. Each was
 * written independently, and they had already drifted — the rejection path took
 * `findFirst()` on the transaction types and wrote `txType?.id ?? ''` into a
 * required uuid column, while its siblings looked the type up by code and threw
 * a clear error when it was missing. Rejection failed with an opaque Prisma
 * error, and had been failing for as long as the feature existed.
 *
 * That is the argument for this file. The four are the same three steps, and
 * three of them agreeing is not a guarantee that the fourth does.
 *
 * The one real difference between them is where a unit came *from*: an approval
 * knows every unit sat in the same pending status, while an automatic approval
 * reads each unit's own status because nothing moved them first. So the
 * previous status is per unit, and a caller with one value for all of them says
 * so by repeating it.
 */
export interface UnitMovement {
  unitId: string;
  /** Where this unit was. Null when the history row should not claim one. */
  previousStatusId?: string | null;
  /** Set only on return, where the condition is re-assessed as it comes back. */
  conditionId?: string;
  /** Overrides the shared note for this unit, as a return's per-item note does. */
  note?: string;
}

export interface MoveUnitsInput {
  units: UnitMovement[];
  /** Where all of them are going. Every caller moves its units together. */
  newStatusId: string;
  transactionTypeId: string;
  /** What the history says happened, for units that do not override it. */
  note: string;
  changedById: string;
}

/**
 * Moves the units and writes one history row each, in the caller's transaction.
 *
 * The status update stays a single `updateMany` because every caller sends one
 * destination; only a condition, which return alone sets, needs a row of its
 * own.
 */
export async function moveUnitsAndRecord(
  tx: Prisma.TransactionClient,
  input: MoveUnitsInput,
): Promise<void> {
  const unitIds = input.units.map((unit) => unit.unitId);
  if (unitIds.length === 0) return;

  await tx.inventoryAssetUnit.updateMany({
    where: { id: { in: unitIds } },
    data: { statusId: input.newStatusId },
  });

  for (const unit of input.units) {
    if (unit.conditionId) {
      await tx.inventoryAssetUnit.update({
        where: { id: unit.unitId },
        data: { conditionId: unit.conditionId },
      });
    }

    await tx.inventoryHistory.create({
      data: {
        unitId: unit.unitId,
        transactionTypeId: input.transactionTypeId,
        ...(unit.previousStatusId
          ? { previousStatusId: unit.previousStatusId }
          : {}),
        newStatusId: input.newStatusId,
        note: unit.note ?? input.note,
        changedById: input.changedById,
      },
    });
  }
}
