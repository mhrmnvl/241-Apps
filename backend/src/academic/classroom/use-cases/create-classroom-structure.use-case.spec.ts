import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { IClassroomStructureRepository } from '../domain/interfaces/classroom-structure-repository.interface.js';
import { CreateClassroomStructureUseCase } from './create-classroom-structure.use-case.js';

describe('CreateClassroomStructureUseCase', () => {
  let useCase: CreateClassroomStructureUseCase;

  const mockRepo = {
    findClassroomById: jest.fn(),
    findSemesterById: jest.fn(),
    findStructure: jest.fn(),
    findActiveEnrollment: jest.fn(),
    findByStudentAndSemester: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassroomStructureUseCase,
        { provide: IClassroomStructureRepository, useValue: mockRepo },
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
    mockRepo.findStructure.mockResolvedValue(null);
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

  it('should throw ConflictException when structure exists', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findStructure.mockResolvedValue({ id: 'existing' });

    await expect(
      useCase.execute({ classroomId: 'cls-1', semesterId: 'sem-1' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create with no officers', async () => {
    mockRepo.findClassroomById.mockResolvedValue({ id: 'cls-1' });
    mockRepo.findSemesterById.mockResolvedValue({ id: 'sem-1' });
    mockRepo.findStructure.mockResolvedValue(null);
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
    mockRepo.findStructure.mockResolvedValue(null);

    await expect(
      useCase.execute({
        classroomId: 'cls-1',
        semesterId: 'sem-1',
        presidentId: 'stu-1',
        secretaryId: 'stu-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
