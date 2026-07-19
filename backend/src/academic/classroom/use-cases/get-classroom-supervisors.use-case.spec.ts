import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomSupervisorQueryDto } from '../dto/classroom-supervisor-query.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';
import { GetClassroomSupervisorsUseCase } from './get-classroom-supervisors.use-case.js';

describe('GetClassroomSupervisorsUseCase', () => {
  let useCase: GetClassroomSupervisorsUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomSupervisorsUseCase,
        { provide: ClassroomSupervisorsRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetClassroomSupervisorsUseCase>(
      GetClassroomSupervisorsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: ClassroomSupervisorQueryDto = { page: 1, limit: 10 };

    it('should return paginated data with meta', async () => {
      const mockData = [{ id: 'sup-1' }, { id: 'sup-2' }];
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

    it('should calculate totalPages correctly for multiple pages', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 25,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return zero totalPages when no records', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
