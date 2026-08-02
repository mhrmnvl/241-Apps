import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';
import { DeleteEducationalHistoryUseCase } from './delete-educational-history.use-case.js';

describe('DeleteEducationalHistoryUseCase', () => {
  let useCase: DeleteEducationalHistoryUseCase;

  const mockRepo = { findById: jest.fn(), softDelete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEducationalHistoryUseCase,
        { provide: IEducationalHistoryRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteEducationalHistoryUseCase>(
      DeleteEducationalHistoryUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'edu-uuid';

    it('should soft-delete and return message', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.softDelete.mockResolvedValue(undefined);

      const result = await useCase.execute(id);

      expect(mockRepo.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        message: 'Educational history deleted successfully',
      });
    });

    it('should throw NotFoundException and not call softDelete', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
