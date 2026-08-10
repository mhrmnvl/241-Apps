import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { ScanEntity, ScanOutcomeEnum } from '../entities/scan.entity.js';

export interface ScanQueryInput extends PaginationQueryInput {
  deviceId?: string;
  credentialId?: string;
  outcome?: ScanOutcomeEnum;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface RecordScanRepositoryInput {
  deviceId: string;
  credentialId?: string | null;
  presentedCode: string;
  clientEventId: string;
  occurredAt: Date;
  outcome: ScanOutcomeEnum;
  rejectionReason?: string | null;
}

export interface ScanWithDevice extends ScanEntity {
  device: { id: string; name: string };
}

export abstract class IScanRepository {
  abstract findAll(
    query: ScanQueryInput,
  ): Promise<PaginatedResult<ScanWithDevice>>;

  /** The retry key. A replayed batch resolves to its original outcome. */
  abstract findByClientEventId(
    deviceId: string,
    clientEventId: string,
  ): Promise<ScanEntity | null>;

  /**
   * The most recent accepted scan for a credential, used to decide whether this
   * one is a repeat within the suppression window or a genuine departure.
   */
  abstract findLastAccepted(credentialId: string): Promise<ScanEntity | null>;

  abstract record(input: RecordScanRepositoryInput): Promise<ScanEntity>;
}
