import { Test, TestingModule } from '@nestjs/testing';
import { StudentQueryDto } from '../dto/request/student-query.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { GetStudentsUseCase } from './get-students.use-case.js';

describe('GetStudentsUseCase', () => {
  let useCase: GetStudentsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentsUseCase,
        { provide: IStudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetStudentsUseCase>(GetStudentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated students with correct meta', async () => {
      const query: StudentQueryDto = { page: 1, limit: 10 };
      mockRepo.findAll.mockResolvedValue({
        data: [{ id: 'stu-1', nis: '2024001' }],
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
      const query: StudentQueryDto = { page: 1, limit: 5 };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 12,
        page: 1,
        limit: 5,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no students exist', async () => {
      const query: StudentQueryDto = { page: 1, limit: 10 };
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
  });
});
