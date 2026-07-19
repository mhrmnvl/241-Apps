import { Test, TestingModule } from '@nestjs/testing';
import { PositionQueryDto } from '../dto/position-query.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';
import { GetPositionsUseCase } from './get-positions.use-case.js';

describe('GetPositionsUseCase', () => {
  let useCase: GetPositionsUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPositionsUseCase,
        { provide: IPositionRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetPositionsUseCase>(GetPositionsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: PositionQueryDto = { page: 1, limit: 10 };

    it('should return paginated positions with correct meta', async () => {
      const mockData = [
        {
          id: 'pos-1',
          name: 'Kepala Sekolah',
          category: { id: 'cat-1', code: 'MANAGEMENT', name: 'Management' },
        },
        {
          id: 'pos-2',
          name: 'Bendahara',
          category: { id: 'cat-2', code: 'FINANCE', name: 'Finance' },
        },
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

    it('should return empty data when no positions exist', async () => {
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

    it('should forward search, category and isActive filters to repository', async () => {
      const filteredQuery: PositionQueryDto = {
        page: 1,
        limit: 10,
        search: 'Kepala',
        categoryId: 'cat-1',
        isActive: true,
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
