import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { UpdateAchievementUseCase } from './update-achievement.use-case.js';

describe('UpdateAchievementUseCase', () => {
  let useCase: UpdateAchievementUseCase;

  const mockRepo = { findById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAchievementUseCase,
        { provide: IAchievementRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateAchievementUseCase>(UpdateAchievementUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ach-uuid';
    const dto: UpdateAchievementDto = { name: 'Updated Name' };

    it('should update and return achievement', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.update.mockResolvedValue({ id, ...dto });

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({ id, ...dto });
    });

    it('should throw NotFoundException when achievement not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
