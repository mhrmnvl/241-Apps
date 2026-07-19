import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { GetScholarshipByIdUseCase } from './get-scholarship-by-id.use-case.js';

describe('GetScholarshipByIdUseCase', () => {
  let useCase: GetScholarshipByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetScholarshipByIdUseCase,
        { provide: ScholarshipRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetScholarshipByIdUseCase>(GetScholarshipByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return scholarship when found', async () => {
      const id = 'sch-uuid';
      mockRepo.findById.mockResolvedValue({ id, name: 'Test' });

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, name: 'Test' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
