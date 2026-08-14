import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceStatus } from '../../../shared/domain/enums/attendance-status.enum.js';
import { BulkUpsertAttendanceDto } from '../dto/request/bulk-upsert-attendance.dto.js';
import { CreateAttendanceDto } from '../dto/request/create-attendance.dto.js';
import { UpdateAttendanceDto } from '../dto/request/update-attendance.dto.js';
import { AttendanceRecapQueryDto } from '../dto/request/attendance-recap-query.dto.js';
import { AttendanceTrendQueryDto } from '../dto/request/attendance-trend-query.dto.js';
import { GetAttendancesUseCase } from '../use-cases/get-attendances.use-case.js';
import { GetMyAttendancesUseCase } from '../use-cases/get-my-attendances.use-case.js';
import { GetAttendanceByIdUseCase } from '../use-cases/get-attendance-by-id.use-case.js';
import { CreateAttendanceUseCase } from '../use-cases/create-attendance.use-case.js';
import { UpdateAttendanceUseCase } from '../use-cases/update-attendance.use-case.js';
import { DeleteAttendanceUseCase } from '../use-cases/delete-attendance.use-case.js';
import { BulkUpsertAttendanceUseCase } from '../use-cases/bulk-upsert-attendance.use-case.js';
import { GetAttendanceRecapUseCase } from '../use-cases/get-attendance-recap.use-case.js';
import { GetAttendanceTrendUseCase } from '../use-cases/get-attendance-trend.use-case.js';
import { GetAttendanceSuggestionsUseCase } from '../use-cases/get-attendance-suggestions.use-case.js';
import { AttendanceController } from './attendance.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockBulkUpsert = { execute: jest.fn() };
  const mockRecap = { execute: jest.fn() };
  const mockSuggestions = { execute: jest.fn() };
  const mockTrend = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: GetAttendancesUseCase, useValue: mockGetAll },
        {
          provide: GetMyAttendancesUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: GetAttendanceByIdUseCase, useValue: mockGetById },
        { provide: CreateAttendanceUseCase, useValue: mockCreate },
        { provide: UpdateAttendanceUseCase, useValue: mockUpdate },
        { provide: DeleteAttendanceUseCase, useValue: mockDelete },
        {
          provide: BulkUpsertAttendanceUseCase,
          useValue: mockBulkUpsert,
        },
        { provide: GetAttendanceRecapUseCase, useValue: mockRecap },
        { provide: GetAttendanceTrendUseCase, useValue: mockTrend },
        { provide: GetAttendanceSuggestionsUseCase, useValue: mockSuggestions },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAttendancesUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(mockUser, { page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetAttendanceByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'att-1' });
      const result = await controller.findOne(mockUser, 'att-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('att-1');
      expect(result).toEqual({ id: 'att-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateAttendanceUseCase', async () => {
      const dto: CreateAttendanceDto = {
        enrollmentId: 'enr-1',
        date: '2025-01-01',
        status: AttendanceStatus.PRESENT,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(mockUser, dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAttendanceUseCase', async () => {
      const dto: UpdateAttendanceDto = {
        status: AttendanceStatus.PRESENT,
      };
      mockUpdate.execute.mockResolvedValue({ id: 'att-1' });
      await controller.update(mockUser, 'att-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('att-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAttendanceUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'att-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('att-1');
    });
  });

  describe('bulkUpsert', () => {
    it('should delegate to BulkUpsertAttendanceUseCase', async () => {
      const dto: BulkUpsertAttendanceDto = {
        date: '2025-01-01',
        records: [
          {
            enrollmentId: 'enr-1',
            status: AttendanceStatus.PRESENT,
          },
        ],
      };
      mockBulkUpsert.execute.mockResolvedValue({ saved: 1 });
      const result = await controller.bulkUpsert(mockUser, dto);
      expect(mockBulkUpsert.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ saved: 1 });
    });
  });

  describe('getRecap', () => {
    it('should delegate to GetAttendanceRecapUseCase', async () => {
      const q: AttendanceRecapQueryDto = {
        classroomId: 'cls-1',
        semesterId: 'sem-1',
      };
      mockRecap.execute.mockResolvedValue([]);
      const result = await controller.getRecap(mockUser, q);
      expect(mockRecap.execute).toHaveBeenCalledWith(q);
      expect(result).toEqual([]);
    });
  });

  describe('getTrend', () => {
    it('should delegate to GetAttendanceTrendUseCase', async () => {
      const q: AttendanceTrendQueryDto = {
        classroomId: 'cls-1',
        semesterId: 'sem-1',
      };
      mockTrend.execute.mockResolvedValue([]);
      const result = await controller.getTrend(mockUser, q);
      expect(mockTrend.execute).toHaveBeenCalledWith(q);
      expect(result).toEqual([]);
    });
  });

  describe('suggestions', () => {
    const q = {
      classroomId: 'cls-1',
      semesterId: 'sem-1',
      date: '2026-08-10',
    };

    it('should delegate to GetAttendanceSuggestionsUseCase', async () => {
      const expected = {
        date: '2026-08-10',
        suggestions: [],
        unscannedEnrollmentIds: [],
        available: true,
      };
      mockSuggestions.execute.mockResolvedValue(expected);

      await expect(controller.suggestions(q)).resolves.toEqual(expected);
      expect(mockSuggestions.execute).toHaveBeenCalledWith(q);
    });

    // FR-022: the gate suggestion path must not reach any write. If it ever
    // does, this is the test that notices.
    it('never touches a write use case', async () => {
      mockSuggestions.execute.mockResolvedValue({
        date: '2026-08-10',
        suggestions: [],
        unscannedEnrollmentIds: [],
        available: true,
      });

      await controller.suggestions(q);

      expect(mockCreate.execute).not.toHaveBeenCalled();
      expect(mockUpdate.execute).not.toHaveBeenCalled();
      expect(mockBulkUpsert.execute).not.toHaveBeenCalled();
      expect(mockDelete.execute).not.toHaveBeenCalled();
    });

    // FR-020 / FR-037: the recap and the report card read teacher-confirmed
    // per-lesson records. Fetching suggestions changes neither.
    it('leaves the recap untouched', async () => {
      mockSuggestions.execute.mockResolvedValue({
        date: '2026-08-10',
        suggestions: [],
        unscannedEnrollmentIds: [],
        available: true,
      });

      await controller.suggestions(q);

      expect(mockRecap.execute).not.toHaveBeenCalled();
    });
  });
});
