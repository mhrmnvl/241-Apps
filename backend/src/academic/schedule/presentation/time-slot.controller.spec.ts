import { Test, TestingModule } from '@nestjs/testing';
import { CreateTimeSlotDto } from '../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../dto/request/update-time-slot.dto.js';
import { CreateTimeSlotUseCase } from '../use-cases/create-time-slot.use-case.js';
import { DeleteTimeSlotUseCase } from '../use-cases/delete-time-slot.use-case.js';
import { GetTimeSlotByIdUseCase } from '../use-cases/get-time-slot-by-id.use-case.js';
import { GetTimeSlotsUseCase } from '../use-cases/get-time-slots.use-case.js';
import { UpdateTimeSlotUseCase } from '../use-cases/update-time-slot.use-case.js';
import { TimeSlotController } from './time-slot.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('TimeSlotController', () => {
  let controller: TimeSlotController;

  const mockGetTimeSlotsService = { execute: jest.fn() };
  const mockGetTimeSlotByIdService = { execute: jest.fn() };
  const mockCreateTimeSlotService = { execute: jest.fn() };
  const mockUpdateTimeSlotService = { execute: jest.fn() };
  const mockDeleteTimeSlotService = { execute: jest.fn() };

  const user: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeSlotController],
      providers: [
        { provide: GetTimeSlotsUseCase, useValue: mockGetTimeSlotsService },
        {
          provide: GetTimeSlotByIdUseCase,
          useValue: mockGetTimeSlotByIdService,
        },
        { provide: CreateTimeSlotUseCase, useValue: mockCreateTimeSlotService },
        { provide: UpdateTimeSlotUseCase, useValue: mockUpdateTimeSlotService },
        { provide: DeleteTimeSlotUseCase, useValue: mockDeleteTimeSlotService },
      ],
    }).compile();

    controller = module.get<TimeSlotController>(TimeSlotController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetTimeSlotsUseCase with schoolUnitId', async () => {
      const expected = [
        { id: 'ts-1', name: 'Jam ke-1', order: 1 },
        { id: 'ts-2', name: 'Jam ke-2', order: 2 },
      ];
      mockGetTimeSlotsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(user);

      expect(mockGetTimeSlotsService.execute).toHaveBeenCalledWith();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetTimeSlotByIdUseCase with id and schoolUnitId', async () => {
      const id = 'ts-1';
      const expected = { id: 'ts-1', name: 'Jam ke-1' };
      mockGetTimeSlotByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id, user);

      expect(mockGetTimeSlotByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateTimeSlotUseCase with dto and schoolUnitId', async () => {
      const dto: CreateTimeSlotDto = {
        name: 'Jam ke-1',
        startTime: '2024-01-01T07:00:00Z',
        endTime: '2024-01-01T07:30:00Z',
        order: 1,
        typeId: 'type-1',
      };
      const expected = { id: 'ts-new', ...dto };
      mockCreateTimeSlotService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto, user);

      expect(mockCreateTimeSlotService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateTimeSlotUseCase with id, dto, and schoolUnitId', async () => {
      const id = 'ts-1';
      const dto: UpdateTimeSlotDto = { startTime: '2024-01-01T07:15:00Z' };
      const expected = { id: 'ts-1', startTime: '2024-01-01T07:15:00Z' };
      mockUpdateTimeSlotService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto, user);

      expect(mockUpdateTimeSlotService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteTimeSlotUseCase with id and schoolUnitId', async () => {
      const id = 'ts-1';
      mockDeleteTimeSlotService.execute.mockResolvedValue(undefined);

      await controller.remove(id, user);

      expect(mockDeleteTimeSlotService.execute).toHaveBeenCalledWith(id);
    });
  });
});
