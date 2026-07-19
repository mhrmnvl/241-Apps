import { Test, TestingModule } from '@nestjs/testing';
import { CurriculaQueryDto } from '../dto/curriculum-query.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';
import { GetCurriculaUseCase } from './get-curricula.use-case.js';

describe('GetCurriculaUseCase', () => {
  let useCase: GetCurriculaUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurriculaUseCase,
        { provide: ICurriculumRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetCurriculaUseCase>(GetCurriculaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: CurriculaQueryDto = { page: 1, limit: 10 };

    it('should return paginated data with meta', async () => {
      const mockCurricula = [
        { id: 'curr-uuid-1', name: 'Kurikulum Merdeka' },
        { id: 'curr-uuid-2', name: 'Kurikulum 2013' },
      ];
      mockRepository.findAll.mockResolvedValue({
        data: mockCurricula,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockCurricula,
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

    it('should return empty data when no curricula exist', async () => {
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

    it('should pass academicYearId filter to repository', async () => {
      const filteredQuery: CurriculaQueryDto = {
        page: 1,
        limit: 10,
        academicYearId: '550e8400-e29b-41d4-a716-446655440009',
      };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(filteredQuery);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filteredQuery);
    });

    it('should pass search filter to repository', async () => {
      const filteredQuery: CurriculaQueryDto = {
        page: 1,
        limit: 10,
        search: 'merdeka',
      };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(filteredQuery);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filteredQuery);
    });
  });
});
