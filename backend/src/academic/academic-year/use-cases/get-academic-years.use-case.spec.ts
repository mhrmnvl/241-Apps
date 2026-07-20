import { Test, TestingModule } from '@nestjs/testing';
import { AcademicYearQueryDto } from '../dto/request/academic-year-query.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { GetAcademicYearsUseCase } from './get-academic-years.use-case.js';

describe('GetAcademicYearsUseCase', () => {
  let useCase: GetAcademicYearsUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAcademicYearsUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetAcademicYearsUseCase>(GetAcademicYearsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: AcademicYearQueryDto = { page: 1, limit: 10 };

    it('should return paginated academic years', async () => {
      const mockData = [
        { id: 'ay-1', name: '2024/2025', isActive: true },
        { id: 'ay-2', name: '2023/2024', isActive: false },
      ];

      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockData,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 25,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no records', async () => {
      mockRepository.findAll.mockResolvedValue({
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

    it('should pass search query to repository', async () => {
      const searchQuery: AcademicYearQueryDto = {
        page: 1,
        limit: 10,
        search: '2024',
      };

      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(searchQuery);

      expect(mockRepository.findAll).toHaveBeenCalledWith(searchQuery);
    });
  });
});
