import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';
import { UpdateClassroomStructureUseCase } from './update-classroom-structure.use-case.js';

describe('UpdateClassroomStructureUseCase', () => {
  let useCase: UpdateClassroomStructureUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findActiveEnrollment: jest.fn(),
    findByStudentAndSemester: jest.fn(),
    update: jest.fn(),
  };

  const existing = {
    id: 'str-1',
    classroomId: 'cls-1',
    semesterId: 'sem-1',
    presidentId: 'stu-1',
    vicePresidentId: null,
    secretaryId: null,
    treasurerId: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassroomStructureUseCase,
        { provide: ClassroomStructuresRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateClassroomStructureUseCase>(
      UpdateClassroomStructureUseCase,
    );
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('bad', { presidentId: 'stu-2' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update president successfully', async () => {
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.findActiveEnrollment.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByStudentAndSemester.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue({
      ...existing,
      presidentId: 'stu-2',
    });

    const result = await useCase.execute('str-1', { presidentId: 'stu-2' });
    expect(mockRepo.update).toHaveBeenCalledWith('str-1', {
      presidentId: 'stu-2',
    });
    expect(result.presidentId).toBe('stu-2');
  });

  it('should throw BadRequestException when student not enrolled', async () => {
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.findActiveEnrollment.mockResolvedValue(null);

    await expect(
      useCase.execute('str-1', { vicePresidentId: 'stu-bad' }),
    ).rejects.toThrow(BadRequestException);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should skip enrollment check when no student fields changed', async () => {
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockResolvedValue(existing);

    await useCase.execute('str-1', {});
    expect(mockRepo.findActiveEnrollment).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when duplicate student in merged positions', async () => {
    mockRepo.findById.mockResolvedValue(existing);

    await expect(
      useCase.execute('str-1', { secretaryId: 'stu-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException when student already holds position in another structure', async () => {
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.findActiveEnrollment.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByStudentAndSemester.mockResolvedValue({
      id: 'str-other',
      classroom: { code: 'VII-B' },
    });

    await expect(
      useCase.execute('str-1', { vicePresidentId: 'stu-3' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should allow updating same student in same structure (no false positive)', async () => {
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.findActiveEnrollment.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByStudentAndSemester.mockResolvedValue({
      id: 'str-1',
      classroom: { code: 'VII-A' },
    });
    mockRepo.update.mockResolvedValue({ ...existing, presidentId: 'stu-99' });

    const result = await useCase.execute('str-1', { presidentId: 'stu-99' });
    expect(result.presidentId).toBe('stu-99');
  });
});
