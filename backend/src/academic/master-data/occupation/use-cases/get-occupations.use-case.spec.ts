import { Test, TestingModule } from '@nestjs/testing';
import { OccupationQueryDto } from '../dto/occupation-query.dto.js';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';
import { GetOccupationsUseCase } from './get-occupations.use-case.js';

describe('GetOccupationsUseCase', () => {
  let useCase: GetOccupationsUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOccupationsUseCase,
        { provide: IOccupationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetOccupationsUseCase>(GetOccupationsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: OccupationQueryDto = { page: 1, limit: 10 };

    it('should return paginated occupations with correct meta', async () => {
      const mockData = [
        { id: 'occ-1', name: 'Wiraswasta' },
        { id: 'occ-2', name: 'PNS' },
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

    it('should return empty data when no occupations exist', async () => {
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

    it('should forward search and isActive filters to repository', async () => {
      const filteredQuery: OccupationQueryDto = {
        page: 1,
        limit: 10,
        search: 'Wira',
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
