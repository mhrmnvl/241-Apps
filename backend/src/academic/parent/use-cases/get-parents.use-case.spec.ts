import { Test, TestingModule } from '@nestjs/testing';
import { ParentQueryDto } from '../dto/request/parent-query.dto.js';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';
import { GetParentsUseCase } from './get-parents.use-case.js';

describe('GetParentsUseCase', () => {
  let useCase: GetParentsUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetParentsUseCase,
        { provide: IParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetParentsUseCase>(GetParentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: ParentQueryDto = { page: 1, limit: 10 };

    it('should return paginated parents with correct meta', async () => {
      const mockData = [
        { id: 'par-1', name: 'Budi Santoso' },
        { id: 'par-2', name: 'Siti Rahayu' },
      ];
      mockRepo.findAll.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockData,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 25,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no parents exist', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should forward search and occupationId filters to repository', async () => {
      const filteredQuery: ParentQueryDto = {
        page: 1,
        limit: 10,
        search: 'Budi',
        occupationId: '550e8400-e29b-41d4-a716-446655440012',
      };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(filteredQuery);

      expect(mockRepo.findAll).toHaveBeenCalledWith(filteredQuery);
    });
  });
});
