import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { DeleteCurriculumSubjectUseCase } from './delete-curriculum-subject.use-case.js';

describe('DeleteCurriculumSubjectUseCase', () => {
  let useCase: DeleteCurriculumSubjectUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCurriculumSubjectUseCase,
        { provide: ICurriculumSubjectRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteCurriculumSubjectUseCase>(
      DeleteCurriculumSubjectUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft-delete successfully', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'cs-1' });
      mockRepository.softDelete.mockResolvedValue({ id: 'cs-1' });

      await useCase.execute('cs-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('cs-1');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('cs-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cs-missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
