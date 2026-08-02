import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { DeleteAchievementUseCase } from './delete-achievement.use-case.js';

describe('DeleteAchievementUseCase', () => {
  let useCase: DeleteAchievementUseCase;

  const mockRepo = { findById: jest.fn(), softDelete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAchievementUseCase,
        { provide: IAchievementRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteAchievementUseCase>(DeleteAchievementUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ach-uuid';

    it('should soft-delete achievement and return message', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.softDelete.mockResolvedValue(undefined);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Achievement deleted successfully' });
    });

    it('should throw NotFoundException and not call softDelete', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
