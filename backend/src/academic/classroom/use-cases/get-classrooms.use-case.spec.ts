import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomQueryDto } from '../dto/request/classroom-query.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { GetClassroomsUseCase } from './get-classrooms.use-case.js';

describe('GetClassroomsUseCase', () => {
  let useCase: GetClassroomsUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomsUseCase,
        { provide: IClassroomRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetClassroomsUseCase>(GetClassroomsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: ClassroomQueryDto = { page: 1, limit: 10 };

    it('should return paginated result with meta', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [{ id: 'cls-1' }],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should return empty data with zero totalPages', async () => {
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
  });
});
