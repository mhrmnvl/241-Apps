import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { GetAchievementByIdUseCase } from './get-achievement-by-id.use-case.js';

describe('GetAchievementByIdUseCase', () => {
  let useCase: GetAchievementByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAchievementByIdUseCase,
        { provide: AchievementRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetAchievementByIdUseCase>(GetAchievementByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return achievement when found', async () => {
      const id = 'ach-uuid';
      mockRepo.findById.mockResolvedValue({ id, name: 'Test' });

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, name: 'Test' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
