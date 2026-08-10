import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordScanBatchUseCase } from './record-scan-batch.use-case.js';
import { RecordScanUseCase } from './record-scan.use-case.js';

const DEVICE_ID = '33333333-3333-4333-8333-333333333333';

describe('RecordScanBatchUseCase', () => {
  let useCase: RecordScanBatchUseCase;
  const recordScan = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordScanBatchUseCase,
        { provide: RecordScanUseCase, useValue: recordScan },
      ],
    }).compile();

    useCase = module.get(RecordScanBatchUseCase);
    jest.clearAllMocks();
    recordScan.execute.mockResolvedValue({ outcome: 'ACCEPTED' });
  });

  // A batch replayed out of order would record the morning arrival as a
  // departure, which is the whole morning wrong for that person.
  it('processes oldest first regardless of the order sent', async () => {
    await useCase.execute(DEVICE_ID, {
      scans: [
        {
          code: 'c',
          clientEventId: 'later',
          occurredAt: '2026-08-10T14:00:00.000Z',
        },
        {
          code: 'c',
          clientEventId: 'earlier',
          occurredAt: '2026-08-10T07:00:00.000Z',
        },
      ],
    });

    const order = recordScan.execute.mock.calls.map(
      (call) => (call[1] as { clientEventId: string }).clientEventId,
    );
    expect(order).toEqual(['earlier', 'later']);
  });

  it('returns a result per clientEventId so the device clears exactly what landed', async () => {
    const results = await useCase.execute(DEVICE_ID, {
      scans: [
        {
          code: 'a',
          clientEventId: 'e1',
          occurredAt: '2026-08-10T07:00:00.000Z',
        },
        {
          code: 'b',
          clientEventId: 'e2',
          occurredAt: '2026-08-10T07:01:00.000Z',
        },
      ],
    });

    expect(results.map((r) => r.clientEventId)).toEqual(['e1', 'e2']);
  });

  // A revoked card is a settled answer. Marking it unaccepted would leave it
  // queued on the device forever.
  it('marks a rejected scan as settled so it leaves the queue', async () => {
    recordScan.execute.mockResolvedValue({ outcome: 'REJECTED_REVOKED' });

    const [result] = await useCase.execute(DEVICE_ID, {
      scans: [
        {
          code: 'x',
          clientEventId: 'e1',
          occurredAt: '2026-08-10T07:00:00.000Z',
        },
      ],
    });

    expect(result.outcome).toBe('REJECTED_REVOKED');
    expect(result.accepted).toBe(true);
  });

  it('refuses a batch larger than the cap', async () => {
    const tooMany = Array.from({ length: 501 }, (_, i) => ({
      code: 'c',
      clientEventId: `e${i}`,
      occurredAt: '2026-08-10T07:00:00.000Z',
    }));

    await expect(
      useCase.execute(DEVICE_ID, { scans: tooMany }),
    ).rejects.toThrow(BadRequestException);
    expect(recordScan.execute).not.toHaveBeenCalled();
  });

  it('handles an empty flush without touching the scan path', async () => {
    await expect(useCase.execute(DEVICE_ID, { scans: [] })).resolves.toEqual(
      [],
    );
    expect(recordScan.execute).not.toHaveBeenCalled();
  });
});
