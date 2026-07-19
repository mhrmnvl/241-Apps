import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import { DeleteStudentGraduationUseCase } from './delete-student-graduation.use-case.js';

describe('DeleteStudentGraduationUseCase', () => {
  let useCase: DeleteStudentGraduationUseCase;

  const mockRepo = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteStudentGraduationUseCase,
        { provide: IGraduationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteStudentGraduationUseCase>(
      DeleteStudentGraduationUseCase,
    );
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should soft-delete graduation successfully', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'grad-1' });
      mockRepo.softDelete.mockResolvedValue({ id: 'grad-1' });
      await useCase.execute('grad-1');
      expect(mockRepo.findById).toHaveBeenCalledWith('grad-1');
      expect(mockRepo.softDelete).toHaveBeenCalledWith('grad-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute('grad-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
