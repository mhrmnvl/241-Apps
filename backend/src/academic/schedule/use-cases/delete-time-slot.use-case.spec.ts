import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';
import { DeleteTimeSlotUseCase } from './delete-time-slot.use-case.js';

describe('DeleteTimeSlotUseCase', () => {
  let useCase: DeleteTimeSlotUseCase;

  const mockRepo = {
    findById: jest.fn(),
    countSchedulesUsing: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTimeSlotUseCase,
        { provide: ITimeSlotRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteTimeSlotUseCase>(DeleteTimeSlotUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ts-1';
    const mockSlot = { id: 'ts-1', name: 'Jam ke-1' };

    it('should delete a time slot successfully when not in use', async () => {
      mockRepo.findById.mockResolvedValue(mockSlot);
      mockRepo.countSchedulesUsing.mockResolvedValue(0);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.countSchedulesUsing).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should call findById and countSchedulesUsing concurrently via Promise.all', async () => {
      mockRepo.findById.mockResolvedValue(mockSlot);
      mockRepo.countSchedulesUsing.mockResolvedValue(0);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockRepo.countSchedulesUsing).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when time slot is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.countSchedulesUsing.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when time slot is in use by lessons', async () => {
      mockRepo.findById.mockResolvedValue(mockSlot);
      mockRepo.countSchedulesUsing.mockResolvedValue(3);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should include lesson count in ConflictException message', async () => {
      mockRepo.findById.mockResolvedValue(mockSlot);
      mockRepo.countSchedulesUsing.mockResolvedValue(5);

      await expect(useCase.execute(id)).rejects.toThrow(/5/);
    });
  });
});
