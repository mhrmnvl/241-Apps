import type { ImportPreviewRow, ImportResolveDecision } from '../types'

/**
 * Builds the payload sent to `resolveBulkImportConflicts`: SUCCESS rows are
 * always created, CONFLICT rows follow the user's per-row update/skip choice,
 * and FAILED rows (or rows missing their resolved data) are dropped.
 *
 * A CONFLICT row without an `existingId` is kept, not dropped. That is the
 * shape of a row duplicating an earlier row of the same file: the record it
 * collides with does not exist yet at preview time, and the backend resolves
 * the id when it processes the decision — by which point the earlier row of
 * this same batch has been created. Filtering on `existingId` here is what
 * used to make those rows vanish silently.
 */
export function buildResolveDecisions<TData>(
  rows: ImportPreviewRow<TData>[],
  actions: Record<number, 'update' | 'skip'>,
): ImportResolveDecision<TData>[] {
  return rows
    .filter(
      (row) =>
        (row.status === 'CONFLICT' || row.status === 'SUCCESS') &&
        Boolean(row.data),
    )
    .map((row) => ({
      existingId: row.existingId,
      action:
        row.status === 'SUCCESS' ? 'update' : (actions[row.row] ?? 'skip'),
      data: row.data as TData,
    }))
}
