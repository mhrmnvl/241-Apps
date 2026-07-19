import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomStructureQueryDto } from '../dto/classroom-structure-query.dto.js';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';
import { GetClassroomStructuresUseCase } from './get-classroom-structures.use-case.js';

describe('GetClassroomStructuresUseCase', () => {
  let useCase: GetClassroomStructuresUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomStructuresUseCase,
        { provide: ClassroomStructuresRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetClassroomStructuresUseCase>(
      GetClassroomStructuresUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated result', async () => {
    const query: ClassroomStructureQueryDto = { page: 1, limit: 10 };
    mockRepo.findAll.mockResolvedValue({
      data: [{ id: 'str-1' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute(query);
    expect(result).toEqual({
      data: [{ id: 'str-1' }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('should return empty data', async () => {
    mockRepo.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(0);
  });
});
