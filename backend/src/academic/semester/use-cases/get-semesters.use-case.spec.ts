import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { GetSemestersUseCase } from './get-semesters.use-case.js';

describe('GetSemestersUseCase', () => {
  let useCase: GetSemestersUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSemestersUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetSemestersUseCase>(GetSemestersUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated semesters', async () => {
      const semesters = [
        {
          id: 'sem-1',
          typeId: 'type-odd',
          type: { id: 'type-odd', name: 'ODD' },
          isActive: false,
          academicYear: { id: 'ay-1', name: '2024/2025' },
        },
      ];
      mockRepository.findAll.mockResolvedValue({
        data: semesters,
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(semesters);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 25,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
      });

      expect(result.meta.totalPages).toBe(3);
    });

    it('should pass query filters to repository', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const query = {
        page: 1,
        limit: 10,
        academicYearId: 'ay-1',
        isActive: true,
      };
      await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
    });
  });
});
