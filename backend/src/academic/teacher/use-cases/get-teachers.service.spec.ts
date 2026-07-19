import { Test, TestingModule } from '@nestjs/testing';
import { TeacherQueryDto } from '../dto/request/teacher-query.request.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { GetTeachersUseCase } from './get-teachers.use-case.js';

describe('GetTeachersUseCase', () => {
  let useCase: GetTeachersUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTeachersUseCase,
        { provide: TeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetTeachersUseCase>(GetTeachersUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: TeacherQueryDto = { page: 1, limit: 10 };

    it('should return paginated teachers with correct meta', async () => {
      const mockData = [
        { id: 'emp-1', profile: { name: 'Budi Santoso' } },
        { id: 'emp-2', profile: { name: 'Siti Rahayu' } },
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

    it('should return empty data when no records exist', async () => {
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

    it('should forward search query to repository', async () => {
      const searchQuery: TeacherQueryDto = {
        page: 1,
        limit: 10,
        search: 'Budi',
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
