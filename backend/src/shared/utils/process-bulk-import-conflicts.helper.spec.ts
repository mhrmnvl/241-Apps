import { Logger } from '@nestjs/common';
import { processBulkImportConflicts } from './process-bulk-import-conflicts.helper.js';

describe('processBulkImportConflicts', () => {
  const logger = { warn: jest.fn() } as unknown as Logger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips items marked as skip without calling process', async () => {
    const process = jest.fn();
    const items = [{ action: 'skip' as const, existingId: 'id-1' }];

    const result = await processBulkImportConflicts(
      items,
      'thing',
      logger,
      process,
    );

    expect(process).not.toHaveBeenCalled();
    expect(result).toEqual({
      total: 1,
      updated: 0,
      skipped: 1,
      failed: 0,
      errors: [],
    });
  });

  it('counts a successful process call as updated', async () => {
    const process = jest.fn().mockResolvedValue(undefined);
    const items = [{ action: 'update' as const, existingId: 'id-1' }];

    const result = await processBulkImportConflicts(
      items,
      'thing',
      logger,
      process,
    );

    expect(process).toHaveBeenCalledWith(items[0]);
    expect(result).toEqual({
      total: 1,
      updated: 1,
      skipped: 0,
      failed: 0,
      errors: [],
    });
  });

  it('records the error and continues when process throws, instead of swallowing it', async () => {
    const process = jest.fn().mockRejectedValue(new Error('boom'));
    const items = [{ action: 'update' as const, existingId: 'id-1' }];

    const result = await processBulkImportConflicts(
      items,
      'thing',
      logger,
      process,
    );

    expect(result.updated).toBe(0);
    // A row that threw is reported as failed, not skipped: skipped is a choice
    // the caller made, and folding the two together tells someone their import
    // went to plan when part of it did not land.
    expect(result.failed).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([{ existingId: 'id-1', error: 'boom' }]);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to resolve conflict/creation for thing id-1',
      ),
    );
  });

  it('uses NEW_ROW as the error identifier when existingId is absent', async () => {
    const process = jest.fn().mockRejectedValue(new Error('boom'));
    const items = [{ action: 'update' as const }];

    const result = await processBulkImportConflicts(
      items,
      'thing',
      logger,
      process,
    );

    expect(result.errors).toEqual([{ existingId: 'NEW_ROW', error: 'boom' }]);
  });

  it('processes multiple items independently and reports the aggregate result', async () => {
    const process = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('boom'));
    const items = [
      { action: 'update' as const, existingId: 'id-1' },
      { action: 'update' as const, existingId: 'id-2' },
    ];

    const result = await processBulkImportConflicts(
      items,
      'thing',
      logger,
      process,
    );

    expect(result.total).toBe(2);
    expect(result.updated).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([{ existingId: 'id-2', error: 'boom' }]);
  });
});
