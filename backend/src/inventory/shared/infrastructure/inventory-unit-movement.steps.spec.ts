import { moveUnitsAndRecord } from './inventory-unit-movement.steps.js';
import type { Prisma } from '@prisma/client';

/**
 * Moving units and recording why, asserted once for the four paths that do it.
 *
 * They were four independent copies until now, and they had already drifted:
 * the rejection path wrote `txType?.id ?? ''` into a required uuid column while
 * its three siblings looked the type up by code and threw a clear error. It
 * failed with an opaque Prisma error for as long as the feature existed, and
 * three of four agreeing was no protection at all.
 */
describe('moveUnitsAndRecord', () => {
  function txSpy() {
    const updateMany = jest.fn().mockResolvedValue({ count: 0 });
    const update = jest.fn().mockResolvedValue({});
    const create = jest.fn().mockResolvedValue({});

    const tx = {
      inventoryAssetUnit: { updateMany, update },
      inventoryHistory: { create },
    } as unknown as Prisma.TransactionClient;

    return { tx, updateMany, update, create };
  }

  it('moves every unit to the destination in one statement', async () => {
    const { tx, updateMany } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [{ unitId: 'u1' }, { unitId: 'u2' }],
      newStatusId: 'st-loaned',
      transactionTypeId: 'tx-out',
      note: 'Dipinjam',
      changedById: 'user-1',
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['u1', 'u2'] } },
      data: { statusId: 'st-loaned' },
    });
  });

  it('writes one history row per unit, never one for the batch', async () => {
    const { tx, create } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [{ unitId: 'u1' }, { unitId: 'u2' }, { unitId: 'u3' }],
      newStatusId: 'st-avail',
      transactionTypeId: 'tx-cancel',
      note: 'Ditolak',
      changedById: 'user-1',
    });

    expect(create).toHaveBeenCalledTimes(3);
  });

  /**
   * The difference between the approval paths and the automatic one: an
   * approval knows every unit sat in the same pending status, while an
   * automatic approval reads each unit's own, because nothing moved them first.
   */
  it("records each unit's own previous status when they differ", async () => {
    const { tx, create } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [
        { unitId: 'u1', previousStatusId: 'st-a' },
        { unitId: 'u2', previousStatusId: 'st-b' },
      ],
      newStatusId: 'st-loaned',
      transactionTypeId: 'tx-out',
      note: 'Otomatis disetujui',
      changedById: 'user-1',
    });

    expect(create.mock.calls[0][0].data.previousStatusId).toBe('st-a');
    expect(create.mock.calls[1][0].data.previousStatusId).toBe('st-b');
  });

  /**
   * A return says where the unit arrived, not where it had been. Writing a
   * previous status of `undefined` into the column would be a claim the path
   * cannot make.
   */
  it('omits the previous status when the caller has none', async () => {
    const { tx, create } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [{ unitId: 'u1' }],
      newStatusId: 'st-avail',
      transactionTypeId: 'tx-in',
      note: 'Dikembalikan',
      changedById: 'user-1',
    });

    expect(create.mock.calls[0][0].data).not.toHaveProperty('previousStatusId');
  });

  it('re-assesses condition only where the caller sets one', async () => {
    const { tx, update } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [{ unitId: 'u1', conditionId: 'cond-damaged' }, { unitId: 'u2' }],
      newStatusId: 'st-avail',
      transactionTypeId: 'tx-in',
      note: 'Dikembalikan',
      changedById: 'user-1',
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { conditionId: 'cond-damaged' },
    });
  });

  it('prefers a per-unit note over the shared one', async () => {
    const { tx, create } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [{ unitId: 'u1', note: 'Layar retak' }, { unitId: 'u2' }],
      newStatusId: 'st-avail',
      transactionTypeId: 'tx-in',
      note: 'Pengembalian pinjaman',
      changedById: 'user-1',
    });

    expect(create.mock.calls[0][0].data.note).toBe('Layar retak');
    expect(create.mock.calls[1][0].data.note).toBe('Pengembalian pinjaman');
  });

  it('touches nothing when there are no units', async () => {
    const { tx, updateMany, create } = txSpy();

    await moveUnitsAndRecord(tx, {
      units: [],
      newStatusId: 'st-avail',
      transactionTypeId: 'tx-in',
      note: 'Kosong',
      changedById: 'user-1',
    });

    expect(updateMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
