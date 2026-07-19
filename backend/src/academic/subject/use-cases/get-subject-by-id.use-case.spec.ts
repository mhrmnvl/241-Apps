import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';
import { GetSubjectByIdUseCase } from './get-subject-by-id.use-case.js';

describe('GetSubjectByIdUseCase', () => {
  let useCase: GetSubjectByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubjectByIdUseCase,
        { provide: ISubjectRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetSubjectByIdUseCase>(GetSubjectByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sub-1';

    it('should return a subject when found', async () => {
      const mockSubject = { id: 'sub-1', name: 'Mathematics' };
      mockRepo.findById.mockResolvedValue(mockSubject);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException when subject is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
