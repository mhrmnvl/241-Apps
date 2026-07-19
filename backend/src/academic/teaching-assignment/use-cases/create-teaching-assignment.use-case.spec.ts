import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTeachingAssignmentUseCase } from './create-teaching-assignment.use-case.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

describe('CreateTeachingAssignmentUseCase', () => {
  let useCase: CreateTeachingAssignmentUseCase;
  const mockRepo = {
    findClassroomById: jest.fn(),
    findSemesterById: jest.fn(),
    findDuplicate: jest.fn(),
    findSoftDeleted: jest.fn(),
    restore: jest.fn(),
    create: jest.fn(),
  };

  const dto = {
    teacherId: 'emp-1',
    classroomId: 'cls-1',
    subjectId: 'sub-1',
    semesterId: 'sem-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTeachingAssignmentUseCase,
        { provide: ITeachingAssignmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateTeachingAssignmentUseCase>(
      CreateTeachingAssignmentUseCase,
    );
    jest.clearAllMocks();
    mockRepo.findClassroomById.mockResolvedValue({
      id: 'cls-1',
      academicYearId: 'ay-1',
    });
    mockRepo.findSemesterById.mockResolvedValue({
      id: 'sem-1',
      academicYearId: 'ay-1',
    });
  });

  it('should create a teaching assignment', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'new-ta', ...dto });

    const result = await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id', 'new-ta');
  });

  it('should throw ConflictException if duplicate exists', async () => {
    mockRepo.findDuplicate.mockResolvedValue({ id: 'dup' });

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });

  it('should restore soft-deleted record', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue({ id: 'ta-deleted' });
    mockRepo.restore.mockResolvedValue({ id: 'ta-deleted', ...dto });

    const result = await useCase.execute(dto);

    expect(mockRepo.restore).toHaveBeenCalledWith('ta-deleted', dto);
    expect(result).toHaveProperty('id', 'ta-deleted');
  });

  it('should throw BadRequestException for cross-year mismatch', async () => {
    mockRepo.findClassroomById.mockResolvedValue({
      id: 'cls-1',
      academicYearId: 'ay-1',
    });
    mockRepo.findSemesterById.mockResolvedValue({
      id: 'sem-1',
      academicYearId: 'ay-2',
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });
});
