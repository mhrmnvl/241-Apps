import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';
import { CreateTimeSlotUseCase } from './create-time-slot.use-case.js';

describe('CreateTimeSlotUseCase', () => {
  let useCase: CreateTimeSlotUseCase;

  const mockRepo = {
    findByOrder: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTimeSlotUseCase,
        { provide: ITimeSlotRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateTimeSlotUseCase>(CreateTimeSlotUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateTimeSlotDto = {
      name: 'Jam ke-1',
      startTime: '07:00',
      endTime: '07:30',
      order: 1,
      typeId: 'type-1',
    };

    it('should create a time slot successfully', async () => {
      const created = { id: 'ts-1', ...dto };
      mockRepo.findByOrder.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByOrder).toHaveBeenCalledWith(dto.order);
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should create a time slot with custom typeId field', async () => {
      const dtoWithType: CreateTimeSlotDto = {
        name: 'Istirahat',
        startTime: '10:00',
        endTime: '10:15',
        order: 5,
        typeId: 'type-2',
      };
      const created = { id: 'ts-5', ...dtoWithType };
      mockRepo.findByOrder.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dtoWithType);

      expect(mockRepo.create).toHaveBeenCalledWith(dtoWithType);
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when order already exists', async () => {
      mockRepo.findByOrder.mockResolvedValue({ id: 'ts-existing', order: 1 });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
