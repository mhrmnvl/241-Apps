import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import { CreateStudentGraduationUseCase } from './create-student-graduation.use-case.js';

describe('CreateStudentGraduationUseCase', () => {
  let useCase: CreateStudentGraduationUseCase;

  const mockRepo = {
    findByStudentId: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStudentGraduationUseCase,
        { provide: IGraduationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateStudentGraduationUseCase>(
      CreateStudentGraduationUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create graduation successfully', async () => {
      mockRepo.findByStudentId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'grad-1' });

      const dto = {
        studentId: 'stu-1',
        academicYearId: 'ay-1',
      };
      const result = await useCase.execute(dto);

      expect(mockRepo.findByStudentId).toHaveBeenCalledWith('stu-1');
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('grad-1');
    });

    it('should throw ConflictException if student already graduated', async () => {
      mockRepo.findByStudentId.mockResolvedValue({ id: 'existing' });

      await expect(
        useCase.execute({
          studentId: 'stu-1',
          academicYearId: 'ay-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
