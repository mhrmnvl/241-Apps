import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import { IDailyPresenceRepository } from '../../daily-record/domain/interfaces/daily-presence-repository.interface.js';
import { DayStatusService } from '../../daily-record/services/day-status.service.js';
import { IDeviceRepository } from '../../device/domain/interfaces/device-repository.interface.js';
import { ServerClockService } from '../../shared/services/server-clock.service.js';
import { IScanRepository } from '../domain/interfaces/scan-repository.interface.js';
import { RecordScanUseCase } from './record-scan.use-case.js';

const DEVICE_ID = '33333333-3333-4333-8333-333333333333';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const MORNING = new Date('2026-08-10T07:05:00.000Z');
const AFTERNOON = new Date('2026-08-10T14:05:00.000Z');

const CREDENTIAL = {
  id: 'cred-1',
  userId: USER_ID,
  subjectType: 'EMPLOYEE' as const,
  status: 'ACTIVE' as const,
  holderIsActive: true,
  displayName: 'Ahmad Fauzi',
  photoUrl: null,
};

function dto(overrides: Record<string, unknown> = {}) {
  return { code: 'card-code', clientEventId: 'event-1', ...overrides };
}

describe('RecordScanUseCase', () => {
  let useCase: RecordScanUseCase;
  const scans = {
    findByClientEventId: jest.fn(),
    findLastAccepted: jest.fn(),
    record: jest.fn(),
    findAll: jest.fn(),
  };
  const credentials = { findByCode: jest.fn() };
  const dailyPresence = {
    findByUserAndDate: jest.fn(),
    upsertCheckIn: jest.fn(),
    recordCheckOut: jest.fn(),
  };
  const devices = { touchLastSeen: jest.fn() };
  const dayStatus = { judgeArrival: jest.fn(), judgeDeparture: jest.fn() };
  const clock = { resolveOccurredAt: jest.fn(), now: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordScanUseCase,
        { provide: IScanRepository, useValue: scans },
        { provide: ICredentialRepository, useValue: credentials },
        { provide: IDailyPresenceRepository, useValue: dailyPresence },
        { provide: IDeviceRepository, useValue: devices },
        { provide: DayStatusService, useValue: dayStatus },
        { provide: ServerClockService, useValue: clock },
      ],
    }).compile();

    useCase = module.get(RecordScanUseCase);
    jest.clearAllMocks();

    scans.findByClientEventId.mockResolvedValue(null);
    scans.findLastAccepted.mockResolvedValue(null);
    credentials.findByCode.mockResolvedValue(CREDENTIAL);
    dailyPresence.findByUserAndDate.mockResolvedValue(null);
    dayStatus.judgeArrival.mockResolvedValue({
      status: 'PRESENT',
      lateMinutes: 0,
      workPatternId: 'pattern-1',
    });
    dayStatus.judgeDeparture.mockResolvedValue(0);
    clock.now.mockReturnValue(MORNING);
    clock.resolveOccurredAt.mockReturnValue({
      accepted: true,
      occurredAt: MORNING,
    });
    devices.touchLastSeen.mockResolvedValue(undefined);
    dailyPresence.upsertCheckIn.mockImplementation(
      (input: { status: string; lateMinutes: number }) => ({
        ...input,
        id: 'day-1',
        leaveRequestId: null,
      }),
    );
  });

  describe('check-in', () => {
    it('records the arrival and reports the person', async () => {
      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.outcome).toBe('ACCEPTED');
      expect(result.direction).toBe('CHECK_IN');
      expect(result.person?.displayName).toBe('Ahmad Fauzi');
      expect(dailyPresence.upsertCheckIn).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          checkInAt: MORNING,
          status: 'PRESENT',
          source: 'SCAN',
        }),
      );
    });

    it('reports lateness to the person at the gate', async () => {
      dayStatus.judgeArrival.mockResolvedValue({
        status: 'LATE',
        lateMinutes: 12,
        workPatternId: 'pattern-1',
      });

      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.dayStatus).toBe('LATE');
      expect(result.lateMinutes).toBe(12);
    });

    it('stores the pattern that judged the day', async () => {
      await useCase.execute(DEVICE_ID, dto());

      expect(dailyPresence.upsertCheckIn).toHaveBeenCalledWith(
        expect.objectContaining({ workPatternId: 'pattern-1' }),
      );
    });

    it('marks the gate as alive', async () => {
      await useCase.execute(DEVICE_ID, dto());

      expect(devices.touchLastSeen).toHaveBeenCalledWith(DEVICE_ID, MORNING);
    });
  });

  describe('check-out', () => {
    beforeEach(() => {
      dailyPresence.findByUserAndDate.mockResolvedValue({
        id: 'day-1',
        checkInAt: MORNING,
        lateMinutes: 0,
        status: 'PRESENT',
      });
      scans.findLastAccepted.mockResolvedValue({ occurredAt: MORNING });
      clock.resolveOccurredAt.mockReturnValue({
        accepted: true,
        occurredAt: AFTERNOON,
      });
    });

    it('records the departure on a later scan', async () => {
      const result = await useCase.execute(
        DEVICE_ID,
        dto({ clientEventId: 'e2' }),
      );

      expect(result.direction).toBe('CHECK_OUT');
      expect(dailyPresence.recordCheckOut).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'day-1', checkOutAt: AFTERNOON }),
      );
    });

    it('records early departure minutes', async () => {
      dayStatus.judgeDeparture.mockResolvedValue(30);

      await useCase.execute(DEVICE_ID, dto({ clientEventId: 'e2' }));

      expect(dailyPresence.recordCheckOut).toHaveBeenCalledWith(
        expect.objectContaining({ earlyLeaveMinutes: 30 }),
      );
    });
  });

  // FR-006. Without this, a double-tap at 07:00 records a departure at 07:00
  // and the person appears to have worked zero minutes.
  describe('duplicate suppression', () => {
    it('treats a repeat inside the window as the same event', async () => {
      scans.findLastAccepted.mockResolvedValue({
        occurredAt: new Date(MORNING.getTime() - 5_000),
      });

      const result = await useCase.execute(
        DEVICE_ID,
        dto({ clientEventId: 'e2' }),
      );

      expect(result.outcome).toBe('DUPLICATE');
      expect(result.direction).toBe('NONE');
      expect(dailyPresence.recordCheckOut).not.toHaveBeenCalled();
      expect(dailyPresence.upsertCheckIn).not.toHaveBeenCalled();
    });

    // FR-003: even a scan that changed nothing is retained.
    it('still records the duplicate as evidence', async () => {
      scans.findLastAccepted.mockResolvedValue({
        occurredAt: new Date(MORNING.getTime() - 5_000),
      });

      await useCase.execute(DEVICE_ID, dto({ clientEventId: 'e2' }));

      expect(scans.record).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'DUPLICATE' }),
      );
    });

    it('treats a scan outside the window as a departure', async () => {
      scans.findLastAccepted.mockResolvedValue({
        occurredAt: new Date(MORNING.getTime() - 120_000),
      });
      dailyPresence.findByUserAndDate.mockResolvedValue({
        id: 'day-1',
        checkInAt: new Date(MORNING.getTime() - 120_000),
        lateMinutes: 0,
        status: 'PRESENT',
      });

      const result = await useCase.execute(
        DEVICE_ID,
        dto({ clientEventId: 'e2' }),
      );

      expect(result.direction).toBe('CHECK_OUT');
    });
  });

  // Research R4: a retried flush is the normal path, not an edge case.
  describe('replayed requests', () => {
    it('returns the original outcome without writing again', async () => {
      scans.findByClientEventId.mockResolvedValue({
        outcome: 'ACCEPTED',
        occurredAt: MORNING,
      });

      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.outcome).toBe('ACCEPTED');
      expect(scans.record).not.toHaveBeenCalled();
      expect(dailyPresence.upsertCheckIn).not.toHaveBeenCalled();
    });
  });

  describe('rejections', () => {
    // Each returns a result rather than throwing: the kiosk must distinguish
    // "this card is invalid" from "the network failed", or the offline queue
    // retries a revoked card forever.
    it('rejects an unknown code without revealing anyone', async () => {
      credentials.findByCode.mockResolvedValue(null);

      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.outcome).toBe('REJECTED_UNKNOWN');
      expect(result.person).toBeUndefined();
      expect(dailyPresence.upsertCheckIn).not.toHaveBeenCalled();
    });

    it('rejects a revoked card and reveals nothing about its holder', async () => {
      credentials.findByCode.mockResolvedValue({
        ...CREDENTIAL,
        status: 'REVOKED',
      });

      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.outcome).toBe('REJECTED_REVOKED');
      expect(result.person).toBeUndefined();
    });

    it('rejects a card whose holder is deactivated', async () => {
      credentials.findByCode.mockResolvedValue({
        ...CREDENTIAL,
        holderIsActive: false,
      });

      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.outcome).toBe('REJECTED_INACTIVE');
    });

    it('rejects a timestamp outside the offline window', async () => {
      clock.resolveOccurredAt.mockReturnValue({
        accepted: false,
        reason: 'Scan is older than the 8h offline window',
      });

      const result = await useCase.execute(
        DEVICE_ID,
        dto({ occurredAt: '2026-08-01T07:00:00.000Z' }),
      );

      expect(result.outcome).toBe('REJECTED_STALE');
      expect(credentials.findByCode).not.toHaveBeenCalled();
    });

    it('retains every rejection as evidence', async () => {
      credentials.findByCode.mockResolvedValue(null);

      await useCase.execute(DEVICE_ID, dto());

      expect(scans.record).toHaveBeenCalledWith(
        expect.objectContaining({
          outcome: 'REJECTED_UNKNOWN',
          presentedCode: 'card-code',
          credentialId: null,
        }),
      );
    });
  });

  // FR-034. Approved leave is a formal grant; a scan must not silently revoke
  // it, because that status is exactly what payroll reads.
  describe('scanning in on approved leave', () => {
    beforeEach(() => {
      dailyPresence.upsertCheckIn.mockResolvedValue({
        id: 'day-1',
        status: 'ON_LEAVE',
        lateMinutes: 0,
        leaveRequestId: 'leave-1',
      });
    });

    it('keeps the day on leave rather than flipping it to present', async () => {
      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.dayStatus).toBe('ON_LEAVE');
    });

    it('still records the arrival — the scan is evidence, not noise', async () => {
      await useCase.execute(DEVICE_ID, dto());

      expect(scans.record).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'ACCEPTED' }),
      );
      expect(dailyPresence.upsertCheckIn).toHaveBeenCalled();
    });

    it('flags the conflict so somebody looks at it', async () => {
      const result = await useCase.execute(DEVICE_ID, dto());

      expect(result.leaveConflict).toBe(true);
    });

    it('leaves an ordinary day unflagged', async () => {
      const result = await useCase.execute(DEVICE_ID, dto());
      expect(result.leaveConflict).toBe(true);

      dailyPresence.upsertCheckIn.mockResolvedValue({
        id: 'day-2',
        status: 'PRESENT',
        lateMinutes: 0,
        leaveRequestId: null,
      });

      const ordinary = await useCase.execute(
        DEVICE_ID,
        dto({ clientEventId: 'e9' }),
      );
      expect(ordinary.leaveConflict).toBeUndefined();
    });
  });

  // The attendance record is what matters; a bookkeeping failure must not
  // discard the scan that produced it.
  it('records the scan even when marking the device alive fails', async () => {
    devices.touchLastSeen.mockRejectedValue(new Error('device table down'));

    const result = await useCase.execute(DEVICE_ID, dto());

    expect(result.outcome).toBe('ACCEPTED');
    expect(dailyPresence.upsertCheckIn).toHaveBeenCalled();
  });
});
