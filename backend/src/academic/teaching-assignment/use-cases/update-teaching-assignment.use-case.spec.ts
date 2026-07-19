import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTeachingAssignmentUseCase } from './update-teaching-assignment.use-case.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

describe('UpdateTeachingAssignmentUseCase', () => {
  let useCase: UpdateTeachingAssignmentUseCase;
  const mockRepo = {
    findById: jest.fn(),
    findClassroomById: jest.fn(),
    findSemesterById: jest.fn(),
    findDuplicate: jest.fn(),
    update: jest.fn(),
  };

  const existing = {
    id: 'ta-1',
    teacherId: 'emp-1',
    classroomId: 'cls-1',
    subjectId: 'sub-1',
    semesterId: 'sem-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTeachingAssignmentUseCase,
        { provide: ITeachingAssignmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateTeachingAssignmentUseCase>(
      UpdateTeachingAssignmentUseCase,
    );
    jest.clearAllMocks();
    mockRepo.findById.mockResolvedValue(existing);
  });

  it('should update a teaching assignment', async () => {
    const dto = { teacherId: 'emp-2' };
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue({ ...existing, ...dto });

    const result = await useCase.execute('ta-1', dto);

    expect(mockRepo.update).toHaveBeenCalledWith('ta-1', dto);
    expect(result).toHaveProperty('teacherId', 'emp-2');
  });

  it('should throw NotFoundException if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ta-999', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ConflictException on duplicate', async () => {
    const dto = { teacherId: 'emp-2' };
    mockRepo.findDuplicate.mockResolvedValue({ id: 'dup' });

    await expect(useCase.execute('ta-1', dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw BadRequestException for cross-year mismatch', async () => {
    const dto = { classroomId: 'cls-2' };
    mockRepo.findClassroomById.mockResolvedValue({
      id: 'cls-2',
      academicYearId: 'ay-1',
    });
    mockRepo.findSemesterById.mockResolvedValue({
      id: 'sem-1',
      academicYearId: 'ay-2',
    });

    await expect(useCase.execute('ta-1', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should skip cross-year check if class/semester not changing', async () => {
    const dto = { teacherId: 'emp-2' };
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue({ ...existing, ...dto });

    await useCase.execute('ta-1', dto);

    expect(mockRepo.findClassroomById).not.toHaveBeenCalled();
    expect(mockRepo.findSemesterById).not.toHaveBeenCalled();
  });
});
