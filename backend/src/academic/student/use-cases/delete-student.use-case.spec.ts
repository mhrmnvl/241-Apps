import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { DeleteStudentUseCase } from './delete-student.use-case.js';

describe('DeleteStudentUseCase', () => {
  let useCase: DeleteStudentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteStudentUseCase,
        { provide: IStudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteStudentUseCase>(DeleteStudentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'stu-1';
    const mockStudent = { id: 'stu-1', user: { id: 'user-1' } };

    it('should soft-delete a student and their user account', async () => {
      mockRepo.findById.mockResolvedValue(mockStudent);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(id, 'user-1');
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
