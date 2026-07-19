import { Test, TestingModule } from '@nestjs/testing';
import { GetTeachingAssignmentsUseCase } from './get-teaching-assignments.use-case.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

describe('GetTeachingAssignmentsUseCase', () => {
  let useCase: GetTeachingAssignmentsUseCase;
  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTeachingAssignmentsUseCase,
        { provide: ITeachingAssignmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetTeachingAssignmentsUseCase>(
      GetTeachingAssignmentsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should delegate to repository', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 10 };
    mockRepo.findAll.mockResolvedValue(expected);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(expected);
  });
});
