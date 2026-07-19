import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { DeleteScholarshipUseCase } from './delete-scholarship.use-case.js';

describe('DeleteScholarshipUseCase', () => {
  let useCase: DeleteScholarshipUseCase;

  const mockRepo = { findById: jest.fn(), softDelete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteScholarshipUseCase,
        { provide: ScholarshipRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteScholarshipUseCase>(DeleteScholarshipUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sch-uuid';

    it('should soft-delete and return message', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.softDelete.mockResolvedValue(undefined);

      const result = await useCase.execute(id);

      expect(mockRepo.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Scholarship deleted successfully' });
    });

    it('should throw NotFoundException and not call softDelete', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
