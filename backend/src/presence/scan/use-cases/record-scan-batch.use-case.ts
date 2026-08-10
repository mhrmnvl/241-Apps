import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_SCAN_BATCH_SIZE } from '../../shared/constants/presence.constants.js';
import { BatchScanResult } from '../domain/entities/scan.entity.js';
import { RecordScanBatchDto } from '../dto/request/record-scan-batch.dto.js';
import { RecordScanUseCase } from './record-scan.use-case.js';

const ACCEPTED_OUTCOMES = new Set(['ACCEPTED', 'DUPLICATE']);

@Injectable()
export class RecordScanBatchUseCase {
  constructor(private readonly recordScan: RecordScanUseCase) {}

  /**
   * The offline flush.
   *
   * Processed oldest first so an arrival is always applied before the departure
   * that followed it — a batch replayed out of order would record the morning
   * scan as a check-out.
   *
   * Each result carries its `clientEventId` so the device clears exactly the
   * entries the server accepted. A partially applied batch followed by a retry
   * is the normal outcome of a connection dropping mid-flush, and the unique
   * constraint on `(deviceId, clientEventId)` is what makes the retry safe
   * rather than duplicating the morning (research R4, R11).
   */
  async execute(
    deviceId: string,
    dto: RecordScanBatchDto,
  ): Promise<BatchScanResult[]> {
    if (dto.scans.length > MAX_SCAN_BATCH_SIZE) {
      throw new BadRequestException(
        `Send at most ${MAX_SCAN_BATCH_SIZE} scans per batch`,
      );
    }

    const ordered = [...dto.scans].sort(byOccurredAt);
    const results: BatchScanResult[] = [];

    for (const scan of ordered) {
      const result = await this.recordScan.execute(deviceId, scan);
      results.push({
        clientEventId: scan.clientEventId,
        outcome: result.outcome,
        // A rejection is a settled answer, not a failure to retry — the device
        // clears it either way, or a revoked card queues forever.
        accepted: true,
      });
    }

    return results;
  }
}

function byOccurredAt(
  a: { occurredAt?: string },
  b: { occurredAt?: string },
): number {
  if (!a.occurredAt || !b.occurredAt) return 0;
  return a.occurredAt.localeCompare(b.occurredAt);
}

export { ACCEPTED_OUTCOMES };
