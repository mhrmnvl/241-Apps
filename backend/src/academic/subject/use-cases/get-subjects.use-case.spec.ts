import { Test, TestingModule } from '@nestjs/testing';
import { SubjectQueryDto } from '../dto/subject-query.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';
import { GetSubjectsUseCase } from './get-subjects.use-case.js';

describe('GetSubjectsUseCase', () => {
  let useCase: GetSubjectsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubjectsUseCase,
        { provide: ISubjectRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetSubjectsUseCase>(GetSubjectsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated subjects with correct meta', async () => {
      const query: SubjectQueryDto = { page: 1, limit: 10 };
      mockRepo.findAll.mockResolvedValue({
        data: [{ id: 'sub-1', name: 'Mathematics' }],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should calculate totalPages correctly', async () => {
      const query: SubjectQueryDto = { page: 1, limit: 5 };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 13,
        page: 1,
        limit: 5,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no subjects exist', async () => {
      const query: SubjectQueryDto = { page: 1, limit: 10 };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should forward search filter to repository', async () => {
      const query: SubjectQueryDto = { page: 1, limit: 10, search: 'Math' };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });
  });
});
