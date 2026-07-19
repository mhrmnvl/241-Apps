import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';
import { GetTimeSlotByIdUseCase } from './get-time-slot-by-id.use-case.js';

describe('GetTimeSlotByIdUseCase', () => {
  let useCase: GetTimeSlotByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTimeSlotByIdUseCase,
        { provide: ITimeSlotRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetTimeSlotByIdUseCase>(GetTimeSlotByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ts-1';

    it('should return a time slot when found', async () => {
      const mockSlot = {
        id: 'ts-1',
        name: 'Jam ke-1',
        startTime: '07:00',
        endTime: '07:30',
        order: 1,
      };
      mockRepo.findById.mockResolvedValue(mockSlot);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSlot);
    });

    it('should throw NotFoundException when time slot is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
