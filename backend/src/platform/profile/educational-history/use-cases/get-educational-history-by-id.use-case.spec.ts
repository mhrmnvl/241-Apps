import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { GetEducationalHistoryByIdUseCase } from './get-educational-history-by-id.use-case.js';

describe('GetEducationalHistoryByIdUseCase', () => {
  let useCase: GetEducationalHistoryByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEducationalHistoryByIdUseCase,
        { provide: EducationalHistoryRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetEducationalHistoryByIdUseCase>(
      GetEducationalHistoryByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return record when found', async () => {
      const id = 'edu-uuid';
      mockRepo.findById.mockResolvedValue({ id, level: 'SMA' });

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, level: 'SMA' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
