import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';
import { CreateClassroomStructureUseCase } from './create-classroom-structure.use-case.js';

describe('CreateClassroomStructureUseCase', () => {
  let useCase: CreateClassroomStructureUseCase;

  const mockRepo = {
    findClassroomById: jest.fn(),
    findSemesterById: jest.fn(),
    findByClassroomAndSemester: jest.fn(),
    findActiveEnrollment: jest.fn(),
    findByStudentAndSemester: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassroomStructureUseCase,
        { provide: ClassroomStructuresRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateClassroomStructureUseCase>(
      CreateClassroomStructureUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create structure successfully', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
    mockRepo.findActiveEnrollment.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByStudentAndSemester.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'str-1' });

    const result = await useCase.execute({
      classroomId: 'cls-1',
      semesterId: 'sem-1',
      presidentId: 'stu-1',
    });

    expect(mockRepo.create).toHaveBeenCalled();
    expect(result.id).toBe('str-1');
  });

  it('should throw NotFoundException when class not found', async () => {
    mockRepo.findClassroomById.mockResolvedValue(null);
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);

    await expect(
      useCase.execute({ classroomId: 'bad', semesterId: 'sem-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when semester not found', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue(null);
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);

    await expect(
      useCase.execute({ classroomId: 'cls-1', semesterId: 'bad' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when structure exists', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue({ id: 'existing' });

    await expect(
      useCase.execute({ classroomId: 'cls-1', semesterId: 'sem-1' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw BadRequestException when student not enrolled', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
    mockRepo.findActiveEnrollment.mockResolvedValue(null);

    await expect(
      useCase.execute({
        classroomId: 'cls-1',
        semesterId: 'sem-1',
        presidentId: 'stu-bad',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create with no officers', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'str-1' });

    const result = await useCase.execute({
      classroomId: 'cls-1',
      semesterId: 'sem-1',
    });

    expect(mockRepo.findActiveEnrollment).not.toHaveBeenCalled();
    expect(result.id).toBe('str-1');
  });

  it('should throw BadRequestException when same student assigned to multiple positions', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);

    await expect(
      useCase.execute({
        classroomId: 'cls-1',
        semesterId: 'sem-1',
        presidentId: 'stu-1',
        secretaryId: 'stu-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException when student already holds position in another structure', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
    mockRepo.findActiveEnrollment.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByStudentAndSemester.mockResolvedValue({
      id: 'str-other',
      classroom: { code: 'VII-B' },
    });

    await expect(
      useCase.execute({
        classroomId: 'cls-1',
        semesterId: 'sem-1',
        presidentId: 'stu-1',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
