import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateEducationalHistoryDto } from '../dto/request/update-educational-history.dto.js';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { UpdateEducationalHistoryUseCase } from './update-educational-history.use-case.js';

describe('UpdateEducationalHistoryUseCase', () => {
  let useCase: UpdateEducationalHistoryUseCase;

  const mockRepo = { findById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEducationalHistoryUseCase,
        { provide: EducationalHistoryRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateEducationalHistoryUseCase>(
      UpdateEducationalHistoryUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'edu-uuid';
    const dto: UpdateEducationalHistoryDto = { institution: 'Updated School' };

    it('should update and return record', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.update.mockResolvedValue({ id, ...dto });

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({ id, ...dto });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
