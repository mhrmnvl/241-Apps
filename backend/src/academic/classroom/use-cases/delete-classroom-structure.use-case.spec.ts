import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';
import { DeleteClassroomStructureUseCase } from './delete-classroom-structure.use-case.js';

describe('DeleteClassroomStructureUseCase', () => {
  let useCase: DeleteClassroomStructureUseCase;

  const mockRepo = { findById: jest.fn(), softDelete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassroomStructureUseCase,
        { provide: ClassroomStructuresRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteClassroomStructureUseCase>(
      DeleteClassroomStructureUseCase,
    );
    jest.clearAllMocks();
  });

  it('should soft-delete successfully', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'str-1' });
    await useCase.execute('str-1');
    expect(mockRepo.softDelete).toHaveBeenCalledWith('str-1');
  });

  it('should throw NotFoundException', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('bad-id')).rejects.toThrow(NotFoundException);
  });
});
