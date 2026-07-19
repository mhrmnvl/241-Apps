import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';
import { GetTeachingAssignmentByIdUseCase } from './get-teaching-assignment-by-id.use-case.js';

describe('GetTeachingAssignmentByIdUseCase', () => {
  let useCase: GetTeachingAssignmentByIdUseCase;
  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTeachingAssignmentByIdUseCase,
        { provide: ITeachingAssignmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetTeachingAssignmentByIdUseCase>(
      GetTeachingAssignmentByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should return a teaching assignment', async () => {
    const expected = { id: 'ta-1', teacherId: 'emp-1' };
    mockRepo.findById.mockResolvedValue(expected);

    const result = await useCase.execute('ta-1');

    expect(mockRepo.findById).toHaveBeenCalledWith('ta-1');
    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ta-999')).rejects.toThrow(NotFoundException);
  });
});
