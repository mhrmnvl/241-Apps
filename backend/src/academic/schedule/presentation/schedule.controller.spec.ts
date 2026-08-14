import { Test, TestingModule } from '@nestjs/testing';
import { DayEnum as Day } from '../../../shared/domain/enums/day.enum.js';
import { CreateScheduleDto } from '../dto/request/create-schedule.dto.js';
import { UpdateScheduleDto } from '../dto/request/update-schedule.dto.js';
import { CreateScheduleUseCase } from '../use-cases/create-schedule.use-case.js';
import { DeleteScheduleUseCase } from '../use-cases/delete-schedule.use-case.js';
import { GetScheduleByIdUseCase } from '../use-cases/get-schedule-by-id.use-case.js';
import { GetSchedulesUseCase } from '../use-cases/get-schedules.use-case.js';
import { GetMyScheduleUseCase } from '../use-cases/get-my-schedule.use-case.js';
import { GetSchedulesByClassroomUseCase } from '../use-cases/get-schedules-by-classroom.use-case.js';
import { UpdateScheduleUseCase } from '../use-cases/update-schedule.use-case.js';
import { BatchUpsertScheduleUseCase } from '../use-cases/batch-upsert-schedule.use-case.js';
import { ScheduleController } from './schedule.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('ScheduleController', () => {
  let controller: ScheduleController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockGetByClassroom = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockBatchUpsert = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: GetSchedulesUseCase, useValue: mockGetAll },
        { provide: GetMyScheduleUseCase, useValue: { execute: jest.fn() } },
        { provide: GetScheduleByIdUseCase, useValue: mockGetById },
        {
          provide: GetSchedulesByClassroomUseCase,
          useValue: mockGetByClassroom,
        },
        { provide: CreateScheduleUseCase, useValue: mockCreate },
        { provide: UpdateScheduleUseCase, useValue: mockUpdate },
        { provide: DeleteScheduleUseCase, useValue: mockDelete },
        { provide: BatchUpsertScheduleUseCase, useValue: mockBatchUpsert },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetSchedulesUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(mockUser, { page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findByClassroom', () => {
    it('should delegate to GetSchedulesByClassroomUseCase', async () => {
      mockGetByClassroom.execute.mockResolvedValue([]);
      const result = await controller.findByClassroom(mockUser, 'cls-1');
      expect(mockGetByClassroom.execute).toHaveBeenCalledWith('cls-1');
      expect(result).toEqual({ data: [] });
    });
  });

  describe('batchUpsert', () => {
    it('should delegate to BatchUpsertScheduleUseCase', async () => {
      mockBatchUpsert.execute.mockResolvedValue({
        created: 0,
        day: Day.MONDAY,
      });
      const result = await controller.batchUpsert(mockUser, 'cls-1', {
        day: Day.MONDAY,
        lessons: [],
      });
      expect(mockBatchUpsert.execute).toHaveBeenCalledWith('cls-1', {
        day: Day.MONDAY,
        lessons: [],
      });
      expect(result).toEqual({ created: 0, day: Day.MONDAY });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetScheduleByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'sch-1' });
      const result = await controller.findOne(mockUser, 'sch-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('sch-1');
      expect(result).toEqual({ id: 'sch-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateScheduleUseCase', async () => {
      const dto: CreateScheduleDto = {
        teachingAssignmentId: 'ta-1',
        timeSlotId: 'ts-1',
        day: Day.MONDAY,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(mockUser, dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateScheduleUseCase', async () => {
      const dto: UpdateScheduleDto = { day: Day.TUESDAY };
      mockUpdate.execute.mockResolvedValue({ id: 'sch-1' });
      await controller.update(mockUser, 'sch-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('sch-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteScheduleUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'sch-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('sch-1');
    });
  });
});
