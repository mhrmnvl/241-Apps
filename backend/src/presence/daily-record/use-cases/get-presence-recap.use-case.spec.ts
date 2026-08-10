import { Test, TestingModule } from '@nestjs/testing';
import { IAttendancePeriodRepository } from '../../attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { PresenceRecapRow } from '../domain/interfaces/daily-presence-recap.interface.js';
import { IDailyPresenceRepository } from '../domain/interfaces/daily-presence-repository.interface.js';
import {
  ExportPresenceRecapUseCase,
  GetPresenceRecapUseCase,
} from './get-presence-recap.use-case.js';

function row(overrides: Partial<PresenceRecapRow> = {}): PresenceRecapRow {
  return {
    userId: 'user-1',
    displayName: 'Ahmad Fauzi',
    presentDays: 19,
    absentDays: 1,
    lateCount: 3,
    lateMinutes: 47,
    earlyLeaveCount: 0,
    leaveDays: 1,
    officialDutyDays: 0,
    attendanceRate: 95,
    ...overrides,
  };
}

describe('GetPresenceRecapUseCase', () => {
  let recap: GetPresenceRecapUseCase;
  let exportRecap: ExportPresenceRecapUseCase;
  const dailyPresence = { getRecap: jest.fn(), countWorkingDays: jest.fn() };
  const periods = { findByPeriod: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPresenceRecapUseCase,
        ExportPresenceRecapUseCase,
        { provide: IDailyPresenceRepository, useValue: dailyPresence },
        { provide: IAttendancePeriodRepository, useValue: periods },
      ],
    }).compile();

    recap = module.get(GetPresenceRecapUseCase);
    exportRecap = module.get(ExportPresenceRecapUseCase);
    jest.clearAllMocks();
    dailyPresence.getRecap.mockResolvedValue([row()]);
    dailyPresence.countWorkingDays.mockResolvedValue(21);
    periods.findByPeriod.mockResolvedValue(null);
  });

  it('returns the rows with the period header', async () => {
    const result = await recap.execute({ year: 2026, month: 8 });

    expect(result.period).toEqual({
      year: 2026,
      month: 8,
      status: 'OPEN',
      workingDays: 21,
    });
    expect(result.rows).toEqual([row()]);
  });

  // The table only holds months somebody actually closed, so an absent row is
  // an open month rather than a missing one.
  it('treats a month with no period row as open', async () => {
    periods.findByPeriod.mockResolvedValue(null);

    const result = await recap.execute({ year: 2026, month: 8 });

    expect(result.period.status).toBe('OPEN');
  });

  it('reports a closed month as closed', async () => {
    periods.findByPeriod.mockResolvedValue({ status: 'CLOSED' });

    const result = await recap.execute({ year: 2026, month: 8 });

    expect(result.period.status).toBe('CLOSED');
  });

  describe('export', () => {
    // FR-038. The only way to guarantee the export matches the screen is for
    // both to be the same calculation — a second query is a second chance to
    // diverge.
    it('is built on the recap use case, not a second query', async () => {
      await exportRecap.execute({ year: 2026, month: 8 });

      expect(dailyPresence.getRecap).toHaveBeenCalledTimes(1);
    });

    it('carries the same figures the screen shows', async () => {
      const [exported] = await exportRecap.execute({ year: 2026, month: 8 });

      expect(exported).toEqual({
        Nama: 'Ahmad Fauzi',
        Hadir: 19,
        Alpa: 1,
        Terlambat: 3,
        'Menit Terlambat': 47,
        'Pulang Cepat': 0,
        Izin: 1,
        'Dinas Luar': 0,
        'Persentase Kehadiran': 95,
      });
    });

    it('renders a person with no name rather than dropping them', async () => {
      dailyPresence.getRecap.mockResolvedValue([row({ displayName: null })]);

      const [exported] = await exportRecap.execute({ year: 2026, month: 8 });

      expect(exported.Nama).toBe('—');
    });
  });
});
