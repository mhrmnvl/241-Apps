import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import { GetStudentGraduationByIdUseCase } from './get-student-graduation-by-id.use-case.js';

describe('GetStudentGraduationByIdUseCase', () => {
  let useCase: GetStudentGraduationByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentGraduationByIdUseCase,
        { provide: IGraduationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetStudentGraduationByIdUseCase>(
      GetStudentGraduationByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should return graduation when found', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'grad-1' });
    const result = await useCase.execute('grad-1');
    expect(result.id).toBe('grad-1');
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('grad-1')).rejects.toThrow(NotFoundException);
  });
});
