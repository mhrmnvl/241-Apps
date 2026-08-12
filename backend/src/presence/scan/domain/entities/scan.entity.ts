import { ScanOutcome } from '@prisma/client';
import { ScanFeedback } from '../../../daily-record/domain/entities/daily-presence.entity.js';

export type ScanOutcomeEnum = `${ScanOutcome}`;

export interface ScanEntity {
  id: string;
  deviceId: string;
  credentialId?: string | null;
  presentedCode: string;
  clientEventId: string;
  occurredAt: Date;
  receivedAt: Date;
  outcome: ScanOutcomeEnum;
  rejectionReason?: string | null;
}

export interface ScanHolderRef {
  displayName: string | null;
  subjectType: string;
  photoUrl: string | null;
}

/**
 * What the kiosk renders.
 *
 * `person` is absent on every rejection, so an unrecognised card shows only
 * that it was not recognised, and nothing about anyone (FR-004, research R12).
 */
export interface ScanResult extends ScanFeedback {
  outcome: ScanOutcomeEnum;
  person?: ScanHolderRef;
  rejectionReason?: string;
  /**
   * The person scanned in on a day covered by approved leave. The scan is
   * recorded and the leave stands; somebody needs to look at it (FR-034).
   */
  leaveConflict?: boolean;
}

/** One row of an offline flush result, keyed so the device can clear its queue. */
export interface BatchScanResult {
  clientEventId: string;
  outcome: ScanOutcomeEnum;
  accepted: boolean;
}
