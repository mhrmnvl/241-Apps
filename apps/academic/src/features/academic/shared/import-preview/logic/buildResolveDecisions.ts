import type { ImportPreviewRow, ImportResolveDecision } from '../types'

/**
 * Builds the payload sent to `resolveBulkImportConflicts`: SUCCESS rows are
 * always created, CONFLICT rows follow the user's per-row update/skip choice,
 * and FAILED rows (or rows missing their resolved data) are dropped.
 */
export function buildResolveDecisions<TData>(
  rows: ImportPreviewRow<TData>[],
  actions: Record<number, 'update' | 'skip'>,
): ImportResolveDecision<TData>[] {
  return rows
    .filter(
      (row) =>
        Boolean(row.status === 'CONFLICT' && row.existingId && row.data) ||
        Boolean(row.status === 'SUCCESS' && row.data),
    )
    .map((row) => ({
      existingId: row.existingId,
      action:
        row.status === 'SUCCESS' ? 'update' : (actions[row.row] ?? 'skip'),
      data: row.data as TData,
    }))
}
