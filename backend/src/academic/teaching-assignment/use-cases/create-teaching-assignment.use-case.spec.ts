import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTeachingAssignmentUseCase } from './create-teaching-assignment.use-case.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';
import { SKIP_ALREADY_ASSIGNED } from '../domain/types/bulk-assignment.type.js';

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
    classroomIds: ['cls-1'],
    subjectId: 'sub-1',
    semesterId: 'sem-1',
  };

  /** What the repository receives for a single classroom. */
  const rowFor = (classroomId: string) => ({
    teacherId: 'emp-1',
    classroomId,
    subjectId: 'sub-1',
    semesterId: 'sem-1',
  });

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
    mockRepo.findClassroomById.mockImplementation((id: string) =>
      Promise.resolve({ id, academicYearId: 'ay-1' }),
    );
    mockRepo.findSemesterById.mockResolvedValue({
      id: 'sem-1',
      academicYearId: 'ay-1',
    });
  });

  it('should create a teaching assignment', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'new-ta', ...rowFor('cls-1') });

    const result = await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(rowFor('cls-1'));
    expect(result.created).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('should create one assignment per selected classroom', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue(null);
    mockRepo.create.mockImplementation((input: { classroomId: string }) =>
      Promise.resolve({ id: `ta-${input.classroomId}`, ...input }),
    );

    const result = await useCase.execute({
      ...dto,
      classroomIds: ['cls-1', 'cls-2', 'cls-3'],
    });

    expect(mockRepo.create).toHaveBeenCalledTimes(3);
    expect(result.created).toHaveLength(3);
  });

  it('should ignore a classroom listed twice in one request', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'new-ta' });

    const result = await useCase.execute({
      ...dto,
      classroomIds: ['cls-1', 'cls-1'],
    });

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(result.created).toHaveLength(1);
  });

  // The old behaviour failed the whole request on the first duplicate, which
  // made "assign this teacher to the rest of the classes" impossible.
  it('should skip classrooms already assigned and still create the others', async () => {
    mockRepo.findDuplicate.mockImplementation((_t, classroomId: string) =>
      Promise.resolve(classroomId === 'cls-2' ? { id: 'dup' } : null),
    );
    mockRepo.findSoftDeleted.mockResolvedValue(null);
    mockRepo.create.mockImplementation((input: { classroomId: string }) =>
      Promise.resolve({ id: `ta-${input.classroomId}`, ...input }),
    );

    const result = await useCase.execute({
      ...dto,
      classroomIds: ['cls-1', 'cls-2', 'cls-3'],
    });

    expect(result.created).toHaveLength(2);
    expect(result.skipped).toEqual([
      { classroomId: 'cls-2', reason: SKIP_ALREADY_ASSIGNED },
    ]);
  });

  it('should throw ConflictException when every classroom is already assigned', async () => {
    mockRepo.findDuplicate.mockResolvedValue({ id: 'dup' });

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });

  it('should restore soft-deleted record', async () => {
    mockRepo.findDuplicate.mockResolvedValue(null);
    mockRepo.findSoftDeleted.mockResolvedValue({ id: 'ta-deleted' });
    mockRepo.restore.mockResolvedValue({
      id: 'ta-deleted',
      ...rowFor('cls-1'),
    });

    const result = await useCase.execute(dto);

    expect(mockRepo.restore).toHaveBeenCalledWith(
      'ta-deleted',
      rowFor('cls-1'),
    );
    expect(result.created).toHaveLength(1);
  });

  it('should throw BadRequestException for cross-year mismatch', async () => {
    mockRepo.findSemesterById.mockResolvedValue({
      id: 'sem-1',
      academicYearId: 'ay-2',
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  // Fail fast: a bad classroom must not leave half the rows written.
  it('should create nothing when any classroom is invalid', async () => {
    mockRepo.findClassroomById.mockImplementation((id: string) =>
      Promise.resolve(id === 'cls-9' ? null : { id, academicYearId: 'ay-1' }),
    );

    await expect(
      useCase.execute({ ...dto, classroomIds: ['cls-1', 'cls-9'] }),
    ).rejects.toThrow(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
