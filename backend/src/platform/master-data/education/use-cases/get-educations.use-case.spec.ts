import { Test, TestingModule } from '@nestjs/testing';
import { EducationQueryDto } from '../dto/request/education-query.dto.js';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';
import { GetEducationsUseCase } from './get-educations.use-case.js';

describe('GetEducationsUseCase', () => {
  let useCase: GetEducationsUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEducationsUseCase,
        { provide: IEducationRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetEducationsUseCase>(GetEducationsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: EducationQueryDto = { page: 1, limit: 10 };

    it('should return paginated data with meta', async () => {
      const mockEducations = [
        { id: 'edu-uuid-1', name: 'S1' },
        { id: 'edu-uuid-2', name: 'S2' },
      ];
      mockRepository.findAll.mockResolvedValue({
        data: mockEducations,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockEducations,
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

    it('should return empty data when no educations exist', async () => {
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

    it('should pass search filter to repository', async () => {
      const filteredQuery: EducationQueryDto = {
        page: 1,
        limit: 10,
        search: 'S1',
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

    it('should pass isActive filter to repository', async () => {
      const filteredQuery: EducationQueryDto = {
        page: 1,
        limit: 10,
        isActive: true,
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
