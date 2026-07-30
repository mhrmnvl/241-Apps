import { Test, TestingModule } from '@nestjs/testing';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { ClassroomRepository } from '../../classroom/index.js';
import { UpdateStudentUseCase } from './update-student.use-case.js';
import { UpdateStudentProfileUseCase } from './update-student-profile.use-case.js';
import { CreateStudentUseCase } from './create-student.use-case.js';
import { EnsureStudentEnrollmentUseCase } from '../../enrollment/use-cases/ensure-student-enrollment.use-case.js';
import { ResolveBulkImportConflictsUseCase } from './resolve-bulk-import-conflicts.use-case.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    identifier: 'siswa001',
    password: 'P@ssw0rd!',
    name: 'Ahmad Fauzi',
    nik: '3578010101080001',
    gender: 'MALE',
    birthPlace: 'Malang',
    birthDate: '2008-01-01',
    nis: '2024001',
    nisn: '0012345678',
    ...overrides,
  };
}

describe('ResolveBulkImportConflictsUseCase', () => {
  let useCase: ResolveBulkImportConflictsUseCase;

  const mockGradeRepository = {
    findByLevel: jest.fn(),
  };

  const mockClassroomRepository = {
    findByCode: jest.fn(),
  };

  const mockUpdateStudent = {
    execute: jest.fn(),
  };

  const mockUpdateStudentProfile = {
    execute: jest.fn(),
  };

  const mockCreateStudent = {
    execute: jest.fn(),
  };

  const mockEnsureStudentEnrollment = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolveBulkImportConflictsUseCase,
        { provide: IGradeRepository, useValue: mockGradeRepository },
        { provide: ClassroomRepository, useValue: mockClassroomRepository },
        { provide: UpdateStudentUseCase, useValue: mockUpdateStudent },
        {
          provide: UpdateStudentProfileUseCase,
          useValue: mockUpdateStudentProfile,
        },
        { provide: CreateStudentUseCase, useValue: mockCreateStudent },
        {
          provide: EnsureStudentEnrollmentUseCase,
          useValue: mockEnsureStudentEnrollment,
        },
      ],
    }).compile();

    useCase = module.get<ResolveBulkImportConflictsUseCase>(
      ResolveBulkImportConflictsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('skips conflicts marked as skip', async () => {
      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          { existingId: 'stu-1', action: 'skip', data: makeRow() as never },
        ],
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({ total: 1, updated: 0, skipped: 1, errors: [] });
      expect(mockUpdateStudent.execute).not.toHaveBeenCalled();
      expect(mockCreateStudent.execute).not.toHaveBeenCalled();
    });

    it('creates a new student when there is no existingId', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({ id: 'cls-1' });
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-new' });

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            action: 'update',
            data: makeRow({ classroomCode: 'VII-A' }) as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(mockCreateStudent.execute).toHaveBeenCalledWith(
        expect.objectContaining({ classroomId: 'cls-1' }),
      );
      expect(mockEnsureStudentEnrollment.execute).not.toHaveBeenCalled();
      expect(result).toEqual({ total: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('updates an existing student and ensures enrollment when classroomCode resolves', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({ id: 'cls-2' });

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'stu-1',
            action: 'update',
            data: makeRow({ classroomCode: 'VIII-B' }) as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(mockUpdateStudent.execute).toHaveBeenCalledWith(
        'stu-1',
        expect.objectContaining({ nis: '2024001', nisn: '0012345678' }),
      );
      expect(mockUpdateStudentProfile.execute).toHaveBeenCalledWith(
        'stu-1',
        expect.objectContaining({ name: 'Ahmad Fauzi' }),
      );
      expect(mockEnsureStudentEnrollment.execute).toHaveBeenCalledWith(
        'stu-1',
        'cls-2',
      );
      expect(result).toEqual({ total: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('updates an existing student without touching enrollment when there is no classroomCode', async () => {
      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'stu-1',
            action: 'update',
            data: makeRow() as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(mockClassroomRepository.findByCode).not.toHaveBeenCalled();
      expect(mockEnsureStudentEnrollment.execute).not.toHaveBeenCalled();
      expect(result).toEqual({ total: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('looks up a repeated classroom code only once across conflicts', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({ id: 'cls-2' });
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-new' });

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'stu-1',
            action: 'update',
            data: makeRow({ classroomCode: 'VIII-B' }) as never,
          },
          {
            action: 'update',
            data: makeRow({
              nis: '2024002',
              nisn: '0012345679',
              classroomCode: 'VIII-B',
            }) as never,
          },
        ],
      };

      await useCase.execute(dto);

      expect(mockClassroomRepository.findByCode).toHaveBeenCalledTimes(1);
    });

    it('records the error and continues when ensuring enrollment fails, instead of swallowing it', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({ id: 'cls-2' });
      mockEnsureStudentEnrollment.execute.mockRejectedValue(
        new Error('Cannot transfer: enrollment status is DROPPED'),
      );

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'stu-1',
            action: 'update',
            data: makeRow({ classroomCode: 'VIII-B' }) as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors).toEqual([
        {
          existingId: 'stu-1',
          error: 'Cannot transfer: enrollment status is DROPPED',
        },
      ]);
    });
  });
});
