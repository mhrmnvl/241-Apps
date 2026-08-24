import { Injectable } from '@nestjs/common';
import {
  FUTURE_SCAN_TOLERANCE_SECONDS,
  MAX_OFFLINE_WINDOW_HOURS,
} from '../constants/presence.constants.js';

export interface ClockAnchor {
  serverTime: Date;
  anchorId: string;
  maxOfflineWindowHours: number;
}

export type ScanTimeVerdict =
  { accepted: true; occurredAt: Date } | { accepted: false; reason: string };

/**
 * The only source of recorded time in the presence domain.
 *
 * FR-010 says times must not come from the device; SC-013 says they must
 * survive four hours with no server. A monotonic counter resolves the tension:
 * the device pins `performance.now()` to a server instant we hand it here, and
 * an offline scan is stamped `anchor + elapsed`. The only trust placed in the
 * device is *elapsed duration*, which is far weaker than trusting its idea of
 * what time it is — and unlike `Date.now()`, a monotonic counter is unaffected
 * by someone changing the tablet's clock at the gate.
 *
 * This service does not verify the anchor cryptographically. It bounds what a
 * device may claim, and `receivedAt` is stored separately so a device with a
 * bad anchor shows up as a widening gap rather than as quietly wrong
 * attendance.
 */
@Injectable()
export class ServerClockService {
  now(): Date {
    return new Date();
  }

  issueAnchor(): ClockAnchor {
    const serverTime = this.now();
    return {
      serverTime,
      anchorId: crypto.randomUUID(),
      maxOfflineWindowHours: MAX_OFFLINE_WINDOW_HOURS,
    };
  }

  /**
   * Online scans carry no `occurredAt` and are stamped here. Offline scans
   * carry a derived one, which is accepted only inside the offline window.
   */
  resolveOccurredAt(claimed?: Date | null): ScanTimeVerdict {
    const now = this.now();
    if (!claimed) {
      return { accepted: true, occurredAt: now };
    }

    const driftSeconds = (claimed.getTime() - now.getTime()) / 1000;
    if (driftSeconds > FUTURE_SCAN_TOLERANCE_SECONDS) {
      return { accepted: false, reason: 'Scan time is in the future' };
    }

    const ageHours = (now.getTime() - claimed.getTime()) / 3_600_000;
    if (ageHours > MAX_OFFLINE_WINDOW_HOURS) {
      return {
        accepted: false,
        reason: `Scan is older than the ${MAX_OFFLINE_WINDOW_HOURS}h offline window`,
      };
    }

    return { accepted: true, occurredAt: claimed };
  }
}
