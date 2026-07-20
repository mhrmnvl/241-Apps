import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceStatus } from '@prisma/client';
import {
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceRecapQueryDto,
} from '../dto/request/attendance.dto.js';
import {
  GetAttendancesUseCase,
  GetAttendanceByIdUseCase,
  CreateAttendanceUseCase,
  UpdateAttendanceUseCase,
  DeleteAttendanceUseCase,
  BulkUpsertAttendanceUseCase,
  GetAttendanceRecapUseCase,
} from '../use-cases/attendance.use-case.js';
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
        { provide: GetAttendanceByIdUseCase, useValue: mockGetById },
        { provide: CreateAttendanceUseCase, useValue: mockCreate },
        { provide: UpdateAttendanceUseCase, useValue: mockUpdate },
        { provide: DeleteAttendanceUseCase, useValue: mockDelete },
        {
          provide: BulkUpsertAttendanceUseCase,
          useValue: mockBulkUpsert,
        },
        { provide: GetAttendanceRecapUseCase, useValue: mockRecap },
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
});
