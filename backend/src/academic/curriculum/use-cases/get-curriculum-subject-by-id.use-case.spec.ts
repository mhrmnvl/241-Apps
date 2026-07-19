import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { GetCurriculumSubjectByIdUseCase } from './get-curriculum-subject-by-id.use-case.js';

describe('GetCurriculumSubjectByIdUseCase', () => {
  let useCase: GetCurriculumSubjectByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurriculumSubjectByIdUseCase,
        { provide: ICurriculumSubjectRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetCurriculumSubjectByIdUseCase>(
      GetCurriculumSubjectByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return curriculum subject when found', async () => {
      const item = { id: 'cs-1', curriculumId: 'cur-1' };
      mockRepository.findById.mockResolvedValue(item);

      const result = await useCase.execute('cs-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('cs-1');
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cs-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
