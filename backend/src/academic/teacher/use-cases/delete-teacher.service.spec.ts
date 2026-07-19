import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { DeleteTeacherUseCase } from './delete-teacher.use-case.js';

describe('DeleteTeacherUseCase', () => {
  let useCase: DeleteTeacherUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTeacherUseCase,
        { provide: TeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteTeacherUseCase>(DeleteTeacherUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'emp-1';

    it('should soft-delete an teacher successfully', async () => {
      const mockTeacher = { id: 'emp-1', user: { id: 'u-1' } };
      mockRepository.findById.mockResolvedValue(mockTeacher);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id, 'u-1');
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
