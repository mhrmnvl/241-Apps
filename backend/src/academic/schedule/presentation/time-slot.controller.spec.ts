import { Test, TestingModule } from '@nestjs/testing';
import { CreateTimeSlotDto } from '../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../dto/request/update-time-slot.dto.js';
import { CreateTimeSlotUseCase } from '../use-cases/create-time-slot.use-case.js';
import { DeleteTimeSlotUseCase } from '../use-cases/delete-time-slot.use-case.js';
import { GetTimeSlotByIdUseCase } from '../use-cases/get-time-slot-by-id.use-case.js';
import { GetTimeSlotsUseCase } from '../use-cases/get-time-slots.use-case.js';
import { GetTimeSlotTypesUseCase } from '../use-cases/get-time-slot-types.use-case.js';
import { UpdateTimeSlotUseCase } from '../use-cases/update-time-slot.use-case.js';
import { CreateTimeSlotTypeUseCase } from '../use-cases/create-time-slot-type.use-case.js';
import { UpdateTimeSlotTypeUseCase } from '../use-cases/update-time-slot-type.use-case.js';
import { DeleteTimeSlotTypeUseCase } from '../use-cases/delete-time-slot-type.use-case.js';
import { TimeSlotController } from './time-slot.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('TimeSlotController', () => {
  let controller: TimeSlotController;

  const mockGetTimeSlotsService = { execute: jest.fn() };
  const mockGetTimeSlotTypesService = { execute: jest.fn() };
  const mockGetTimeSlotByIdService = { execute: jest.fn() };
  const mockCreateTimeSlotService = { execute: jest.fn() };
  const mockUpdateTimeSlotService = { execute: jest.fn() };
  const mockDeleteTimeSlotService = { execute: jest.fn() };
  const mockCreateTimeSlotTypeService = { execute: jest.fn() };
  const mockUpdateTimeSlotTypeService = { execute: jest.fn() };
  const mockDeleteTimeSlotTypeService = { execute: jest.fn() };

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
          provide: GetTimeSlotTypesUseCase,
          useValue: mockGetTimeSlotTypesService,
        },
        {
          provide: GetTimeSlotByIdUseCase,
          useValue: mockGetTimeSlotByIdService,
        },
        { provide: CreateTimeSlotUseCase, useValue: mockCreateTimeSlotService },
        { provide: UpdateTimeSlotUseCase, useValue: mockUpdateTimeSlotService },
        { provide: DeleteTimeSlotUseCase, useValue: mockDeleteTimeSlotService },
        {
          provide: CreateTimeSlotTypeUseCase,
          useValue: mockCreateTimeSlotTypeService,
        },
        {
          provide: UpdateTimeSlotTypeUseCase,
          useValue: mockUpdateTimeSlotTypeService,
        },
        {
          provide: DeleteTimeSlotTypeUseCase,
          useValue: mockDeleteTimeSlotTypeService,
        },
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

      const result = await controller.findAll();

      expect(mockGetTimeSlotsService.execute).toHaveBeenCalledWith();
      expect(result).toEqual(expected);
    });
  });

  describe('findAllTypes', () => {
    it('should delegate to GetTimeSlotTypesUseCase', async () => {
      const expected = [{ id: 'type-1', code: 'LESSON', name: 'Pelajaran' }];
      mockGetTimeSlotTypesService.execute.mockResolvedValue(expected);

      const result = await controller.findAllTypes();

      expect(mockGetTimeSlotTypesService.execute).toHaveBeenCalledWith();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetTimeSlotByIdUseCase with id and schoolUnitId', async () => {
      const id = 'ts-1';
      const expected = { id: 'ts-1', name: 'Jam ke-1' };
      mockGetTimeSlotByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

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

      const result = await controller.create(dto);

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

      const result = await controller.update(id, dto);

      expect(mockUpdateTimeSlotService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteTimeSlotUseCase with id and schoolUnitId', async () => {
      const id = 'ts-1';
      mockDeleteTimeSlotService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteTimeSlotService.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('createType', () => {
    it('should delegate to CreateTimeSlotTypeUseCase with dto', async () => {
      const dto = { code: 'CEREMONY', name: 'Upacara', isLesson: false };
      const expected = { id: 'type-new', ...dto, days: ['MONDAY'] };
      mockCreateTimeSlotTypeService.execute.mockResolvedValue(expected);

      const result = await controller.createType(dto);

      expect(mockCreateTimeSlotTypeService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('updateType', () => {
    it('should delegate to UpdateTimeSlotTypeUseCase with id and dto', async () => {
      const id = 'type-1';
      const dto = { name: 'Upacara Bendera' };
      const expected = { id, name: 'Upacara Bendera' };
      mockUpdateTimeSlotTypeService.execute.mockResolvedValue(expected);

      const result = await controller.updateType(id, dto);

      expect(mockUpdateTimeSlotTypeService.execute).toHaveBeenCalledWith(
        id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeType', () => {
    it('should delegate to DeleteTimeSlotTypeUseCase with id', async () => {
      const id = 'type-1';
      mockDeleteTimeSlotTypeService.execute.mockResolvedValue(undefined);

      await controller.removeType(id);

      expect(mockDeleteTimeSlotTypeService.execute).toHaveBeenCalledWith(id);
    });
  });
});
