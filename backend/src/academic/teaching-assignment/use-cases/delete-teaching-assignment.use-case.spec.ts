import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTeachingAssignmentUseCase } from './delete-teaching-assignment.use-case.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

describe('DeleteTeachingAssignmentUseCase', () => {
  let useCase: DeleteTeachingAssignmentUseCase;
  const mockRepo = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTeachingAssignmentUseCase,
        { provide: ITeachingAssignmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteTeachingAssignmentUseCase>(
      DeleteTeachingAssignmentUseCase,
    );
    jest.clearAllMocks();
  });

  it('should soft-delete a teaching assignment', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'ta-1' });
    mockRepo.softDelete.mockResolvedValue({ id: 'ta-1' });

    await useCase.execute('ta-1');

    expect(mockRepo.findById).toHaveBeenCalledWith('ta-1');
    expect(mockRepo.softDelete).toHaveBeenCalledWith('ta-1');
  });

  it('should throw NotFoundException if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ta-999')).rejects.toThrow(NotFoundException);
  });
});
