import { Test, TestingModule } from '@nestjs/testing';
import {
  FUTURE_SCAN_TOLERANCE_SECONDS,
  MAX_OFFLINE_WINDOW_HOURS,
} from '../constants/presence.constants.js';
import { ServerClockService } from './server-clock.service.js';

const NOW = new Date('2026-08-10T07:00:00.000Z');

describe('ServerClockService', () => {
  let service: ServerClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServerClockService],
    }).compile();

    service = module.get(ServerClockService);
    jest.spyOn(service, 'now').mockReturnValue(NOW);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('issueAnchor', () => {
    it('returns the server time and the offline window the device must respect', () => {
      const anchor = service.issueAnchor();

      expect(anchor.serverTime).toEqual(NOW);
      expect(anchor.maxOfflineWindowHours).toBe(MAX_OFFLINE_WINDOW_HOURS);
      expect(anchor.anchorId).toHaveLength(36);
    });

    it('mints a distinct id per anchor, so a device cannot reuse a stale one silently', () => {
      expect(service.issueAnchor().anchorId).not.toBe(
        service.issueAnchor().anchorId,
      );
    });
  });

  describe('resolveOccurredAt', () => {
    // The online path. FR-010: the server stamps it, the device does not.
    it('stamps server time when the device claims nothing', () => {
      expect(service.resolveOccurredAt()).toEqual({
        accepted: true,
        occurredAt: NOW,
      });
      expect(service.resolveOccurredAt(null)).toEqual({
        accepted: true,
        occurredAt: NOW,
      });
    });

    // The offline path. SC-013: a scan taken three hours ago keeps the time it
    // actually happened, not the time it reached us.
    it('accepts a derived time inside the offline window', () => {
      const threeHoursAgo = new Date(NOW.getTime() - 3 * 3_600_000);

      expect(service.resolveOccurredAt(threeHoursAgo)).toEqual({
        accepted: true,
        occurredAt: threeHoursAgo,
      });
    });

    it('accepts a scan exactly at the window boundary', () => {
      const atBoundary = new Date(
        NOW.getTime() - MAX_OFFLINE_WINDOW_HOURS * 3_600_000,
      );

      expect(service.resolveOccurredAt(atBoundary).accepted).toBe(true);
    });

    it('rejects a scan older than the offline window', () => {
      const tooOld = new Date(
        NOW.getTime() - (MAX_OFFLINE_WINDOW_HOURS + 1) * 3_600_000,
      );

      expect(service.resolveOccurredAt(tooOld)).toEqual({
        accepted: false,
        reason: expect.stringContaining('offline window'),
      });
    });

    // A device whose anchor is broken can claim the future. Small monotonic
    // drift is tolerated; a claim beyond that is not attendance data.
    it('tolerates small forward drift', () => {
      const slightlyAhead = new Date(
        NOW.getTime() + (FUTURE_SCAN_TOLERANCE_SECONDS - 5) * 1000,
      );

      expect(service.resolveOccurredAt(slightlyAhead).accepted).toBe(true);
    });

    it('rejects a scan meaningfully in the future', () => {
      const wayAhead = new Date(NOW.getTime() + 10 * 60_000);

      expect(service.resolveOccurredAt(wayAhead)).toEqual({
        accepted: false,
        reason: expect.stringContaining('future'),
      });
    });
  });
});
