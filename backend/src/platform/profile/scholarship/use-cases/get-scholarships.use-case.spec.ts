import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipStatus } from '@prisma/client';
import { ScholarshipQueryDto } from '../dto/request/scholarship-query.dto.js';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { GetScholarshipsUseCase } from './get-scholarships.use-case.js';

describe('GetScholarshipsUseCase', () => {
  let useCase: GetScholarshipsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetScholarshipsUseCase,
        { provide: ScholarshipRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetScholarshipsUseCase>(GetScholarshipsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated scholarships', async () => {
      const query: ScholarshipQueryDto = {
        profileId: 'p-1',
        page: 1,
        limit: 20,
      };
      const expected = { data: [{ id: 's-1' }], total: 1, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('should pass enum status filter', async () => {
      const query: ScholarshipQueryDto = {
        status: ScholarshipStatus.COMPLETED,
      };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });
  });
});
