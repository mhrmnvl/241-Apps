import { Logger } from '@nestjs/common';

interface BulkImportConflictItem {
  action: 'update' | 'skip';
  existingId?: string;
}

export interface BulkImportConflictsResult {
  total: number;
  updated: number;
  skipped: number;
  errors: { existingId: string; error: string }[];
}

export async function processBulkImportConflicts<
  TItem extends BulkImportConflictItem,
>(
  items: TItem[],
  entityLabel: string,
  logger: Logger,
  process: (item: TItem) => Promise<void>,
): Promise<BulkImportConflictsResult> {
  let updated = 0;
  let skipped = 0;
  const errors: { existingId: string; error: string }[] = [];

  for (const item of items) {
    if (item.action === 'skip') {
      skipped++;
      continue;
    }

    try {
      await process(item);
      updated++;
    } catch (err) {
      skipped++;
      const message = err instanceof Error ? err.message : 'Unexpected error';
      errors.push({
        existingId: item.existingId ?? 'NEW_ROW',
        error: message,
      });
      logger.warn(
        `Failed to resolve conflict/creation for ${entityLabel} ${item.existingId ?? 'new'}: ${message}`,
      );
    }
  }

  return { total: items.length, updated, skipped, errors };
}
