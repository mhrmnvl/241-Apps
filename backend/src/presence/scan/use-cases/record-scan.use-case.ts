import { Injectable, Logger } from '@nestjs/common';
import { CredentialResolution } from '../../credential/domain/entities/credential.entity.js';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import { IDailyPresenceRepository } from '../../daily-record/domain/interfaces/daily-presence-repository.interface.js';
import { DayStatusService } from '../../daily-record/services/day-status.service.js';
import { IDeviceRepository } from '../../device/domain/interfaces/device-repository.interface.js';
import { DUPLICATE_SCAN_WINDOW_SECONDS } from '../../shared/constants/presence.constants.js';
import { ServerClockService } from '../../shared/services/server-clock.service.js';
import { ScanOutcomeEnum, ScanResult } from '../domain/entities/scan.entity.js';
import { IScanRepository } from '../domain/interfaces/scan-repository.interface.js';
import { RecordScanDto } from '../dto/request/record-scan.dto.js';

/** The date part, in the wall-clock frame the school works in. */
function dateOnly(at: Date): Date {
  return new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()),
  );
}

@Injectable()
export class RecordScanUseCase {
  private readonly logger = new Logger(RecordScanUseCase.name);

  constructor(
    private readonly scans: IScanRepository,
    private readonly credentials: ICredentialRepository,
    private readonly dailyPresence: IDailyPresenceRepository,
    private readonly devices: IDeviceRepository,
    private readonly dayStatus: DayStatusService,
    private readonly clock: ServerClockService,
  ) {}

  /**
   * The gate's hot path.
   *
   * **Rejections return a result, not an exception.** The kiosk must render
   * "kartu tidak berlaku" exactly like a success; an HTTP error would be
   * indistinguishable from a network failure the offline queue should retry,
   * so a revoked card would be retried forever.
   */
  async execute(deviceId: string, dto: RecordScanDto): Promise<ScanResult> {
    const replay = await this.scans.findByClientEventId(
      deviceId,
      dto.clientEventId,
    );
    if (replay) {
      return this.replayed(replay.outcome, replay.occurredAt);
    }

    const time = this.clock.resolveOccurredAt(
      dto.occurredAt ? new Date(dto.occurredAt) : null,
    );
    if (!time.accepted) {
      return this.reject(
        deviceId,
        dto,
        this.clock.now(),
        'REJECTED_STALE',
        time.reason,
      );
    }

    const occurredAt = time.occurredAt;
    const credential = await this.credentials.findByCode(dto.code);

    if (!credential) {
      return this.reject(
        deviceId,
        dto,
        occurredAt,
        'REJECTED_UNKNOWN',
        'Kartu tidak dikenal',
      );
    }
    if (credential.status !== 'ACTIVE') {
      return this.reject(
        deviceId,
        dto,
        occurredAt,
        'REJECTED_REVOKED',
        'Kartu sudah tidak berlaku',
        credential.id,
      );
    }
    if (!credential.holderIsActive) {
      return this.reject(
        deviceId,
        dto,
        occurredAt,
        'REJECTED_INACTIVE',
        'Pemegang kartu tidak aktif',
        credential.id,
      );
    }

    return this.accept(deviceId, dto, occurredAt, credential);
  }

  private async accept(
    deviceId: string,
    dto: RecordScanDto,
    occurredAt: Date,
    credential: CredentialResolution,
  ): Promise<ScanResult> {
    const last = await this.scans.findLastAccepted(credential.id);
    const isRepeat =
      last !== null &&
      (occurredAt.getTime() - last.occurredAt.getTime()) / 1000 <
        DUPLICATE_SCAN_WINDOW_SECONDS;

    if (isRepeat) {
      await this.record(deviceId, dto, occurredAt, 'DUPLICATE', credential.id);
      return this.feedback('DUPLICATE', 'NONE', credential, occurredAt, 0);
    }

    const date = dateOnly(occurredAt);
    const existing = await this.dailyPresence.findByUserAndDate(
      credential.userId,
      date,
    );

    await this.record(deviceId, dto, occurredAt, 'ACCEPTED', credential.id);
    await this.touchDevice(deviceId, occurredAt);

    if (existing?.checkInAt) {
      const earlyLeaveMinutes = await this.dayStatus.judgeDeparture(
        credential.userId,
        date,
        occurredAt,
      );
      await this.dailyPresence.recordCheckOut({
        id: existing.id,
        checkOutAt: occurredAt,
        earlyLeaveMinutes,
        source: 'SCAN',
      });

      return this.feedback(
        'ACCEPTED',
        'CHECK_OUT',
        credential,
        occurredAt,
        existing.lateMinutes,
        existing.status,
      );
    }

    const verdict = await this.dayStatus.judgeArrival(
      credential.userId,
      date,
      occurredAt,
    );
    const recorded = await this.dailyPresence.upsertCheckIn({
      userId: credential.userId,
      subjectType: credential.subjectType,
      date,
      checkInAt: occurredAt,
      status: verdict.status,
      lateMinutes: verdict.lateMinutes,
      workPatternId: verdict.workPatternId,
      source: 'SCAN',
    });

    // The repository keeps an approved-leave day on ON_LEAVE, so the recorded
    // status — not the verdict — is what actually happened (FR-034).
    return {
      ...this.feedback(
        'ACCEPTED',
        'CHECK_IN',
        credential,
        occurredAt,
        recorded.lateMinutes,
        recorded.status,
      ),
      ...(recorded.leaveRequestId ? { leaveConflict: true } : {}),
    };
  }

  private async reject(
    deviceId: string,
    dto: RecordScanDto,
    occurredAt: Date,
    outcome: ScanOutcomeEnum,
    reason: string,
    credentialId?: string,
  ): Promise<ScanResult> {
    await this.record(deviceId, dto, occurredAt, outcome, credentialId, reason);

    // No `person`: an unrecognised or revoked card must leak nothing about who
    // it belongs to (FR-004).
    return {
      outcome,
      direction: 'NONE',
      dayStatus: 'NOT_EXPECTED',
      lateMinutes: 0,
      recordedAt: occurredAt,
      rejectionReason: reason,
    };
  }

  private async record(
    deviceId: string,
    dto: RecordScanDto,
    occurredAt: Date,
    outcome: ScanOutcomeEnum,
    credentialId?: string,
    rejectionReason?: string,
  ): Promise<void> {
    await this.scans.record({
      deviceId,
      credentialId: credentialId ?? null,
      presentedCode: dto.code,
      clientEventId: dto.clientEventId,
      occurredAt,
      outcome,
      rejectionReason: rejectionReason ?? null,
    });
  }

  /**
   * Failing to note that a gate is alive must never fail the scan that proved
   * it — the attendance record is the thing that matters here.
   */
  private async touchDevice(deviceId: string, at: Date): Promise<void> {
    try {
      await this.devices.touchLastSeen(deviceId, at);
    } catch (error) {
      this.logger.warn(
        `Could not update lastSeenAt for device ${deviceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private feedback(
    outcome: ScanOutcomeEnum,
    direction: ScanResult['direction'],
    credential: CredentialResolution,
    recordedAt: Date,
    lateMinutes: number,
    dayStatus: ScanResult['dayStatus'] = 'PRESENT',
  ): ScanResult {
    return {
      outcome,
      direction,
      dayStatus,
      lateMinutes,
      recordedAt,
      person: {
        displayName: credential.displayName,
        subjectType: credential.subjectType,
        photoUrl: credential.photoUrl,
      },
    };
  }

  /** A retried request returns its original outcome so the queue can clear. */
  private replayed(outcome: ScanOutcomeEnum, occurredAt: Date): ScanResult {
    return {
      outcome,
      direction: 'NONE',
      dayStatus: 'NOT_EXPECTED',
      lateMinutes: 0,
      recordedAt: occurredAt,
    };
  }
}
