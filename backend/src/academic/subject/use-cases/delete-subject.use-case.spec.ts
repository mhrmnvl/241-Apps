import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';
import { DeleteSubjectUseCase } from './delete-subject.use-case.js';

describe('DeleteSubjectUseCase', () => {
  let useCase: DeleteSubjectUseCase;

  const mockRepo = {
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSubjectUseCase,
        { provide: ISubjectRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteSubjectUseCase>(DeleteSubjectUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sub-1';

    it('should hard-delete a subject successfully', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'sub-1', name: 'Mathematics' });
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when subject is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
