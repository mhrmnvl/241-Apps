import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTimeSlotDto } from '../dto/request/update-time-slot.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';
import { UpdateTimeSlotUseCase } from './update-time-slot.use-case.js';

describe('UpdateTimeSlotUseCase', () => {
  let useCase: UpdateTimeSlotUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findByOrder: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTimeSlotUseCase,
        { provide: ITimeSlotRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateTimeSlotUseCase>(UpdateTimeSlotUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ts-1';
    const existing = {
      id: 'ts-1',
      name: 'Jam ke-1',
      startTime: '07:00',
      endTime: '07:30',
      order: 1,
    };

    it('should update a time slot successfully without order change', async () => {
      const dto: UpdateTimeSlotDto = { startTime: '07:15' };
      const updated = { ...existing, startTime: '07:15' };
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByOrder).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should update order successfully when it does not conflict', async () => {
      const dto: UpdateTimeSlotDto = { order: 2 };
      const updated = { ...existing, order: 2 };
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.findByOrder.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue(updated);

      await useCase.execute(id, dto);

      expect(mockRepo.findByOrder).toHaveBeenCalledWith(2, id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
    });

    it('should throw ConflictException when new order already exists', async () => {
      const dto: UpdateTimeSlotDto = { order: 2 };
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.findByOrder.mockResolvedValue({ id: 'ts-2', order: 2 });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when time slot is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, { name: 'Jam ke-2' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
