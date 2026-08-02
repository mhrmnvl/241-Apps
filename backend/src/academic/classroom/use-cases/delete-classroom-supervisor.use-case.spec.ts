import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';
import { DeleteClassroomSupervisorUseCase } from './delete-classroom-supervisor.use-case.js';

describe('DeleteClassroomSupervisorUseCase', () => {
  let useCase: DeleteClassroomSupervisorUseCase;

  const mockRepo = {
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassroomSupervisorUseCase,
        { provide: IClassroomSupervisorRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteClassroomSupervisorUseCase>(
      DeleteClassroomSupervisorUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft-delete the supervisor successfully', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'sup-uuid-1' });
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute('sup-uuid-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('sup-uuid-1');
      expect(mockRepo.remove).toHaveBeenCalledWith('sup-uuid-1');
    });

    it('should throw NotFoundException when supervisor not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
