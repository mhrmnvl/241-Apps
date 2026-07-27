import { Test, TestingModule } from '@nestjs/testing';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { UpdateTeacherUseCase } from './update-teacher.use-case.js';
import { UpdateTeacherProfileUseCase } from './update-teacher-profile.use-case.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';
import { ResolveBulkImportConflictsUseCase } from './resolve-bulk-import-conflicts.use-case.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    identifier: 'guru001',
    password: 'P@ssw0rd!',
    name: 'Budi Santoso',
    nik: '3578010101700001',
    gender: 'MALE',
    birthPlace: 'Surabaya',
    birthDate: '1980-06-15',
    nip: '198006152005011001',
    nuptk: '1234567890123456',
    employmentTypeCode: 'PNS',
    ...overrides,
  };
}

describe('ResolveBulkImportConflictsUseCase (teacher)', () => {
  let useCase: ResolveBulkImportConflictsUseCase;

  const mockRepo = {
    resolveEmploymentTypeId: jest.fn().mockResolvedValue('employment-type-id'),
  };

  const mockUpdateTeacher = {
    execute: jest.fn(),
  };

  const mockUpdateTeacherProfile = {
    execute: jest.fn(),
  };

  const mockCreateTeacher = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolveBulkImportConflictsUseCase,
        { provide: TeacherRepository, useValue: mockRepo },
        { provide: UpdateTeacherUseCase, useValue: mockUpdateTeacher },
        {
          provide: UpdateTeacherProfileUseCase,
          useValue: mockUpdateTeacherProfile,
        },
        { provide: CreateTeacherUseCase, useValue: mockCreateTeacher },
      ],
    }).compile();

    useCase = module.get<ResolveBulkImportConflictsUseCase>(
      ResolveBulkImportConflictsUseCase,
    );
    jest.clearAllMocks();
    mockRepo.resolveEmploymentTypeId.mockResolvedValue('employment-type-id');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('skips conflicts marked as skip', async () => {
      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          { existingId: 'gru-1', action: 'skip', data: makeRow() as never },
        ],
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({ total: 1, updated: 0, skipped: 1, errors: [] });
      expect(mockUpdateTeacher.execute).not.toHaveBeenCalled();
      expect(mockCreateTeacher.execute).not.toHaveBeenCalled();
    });

    it('creates a new teacher when there is no existingId', async () => {
      mockCreateTeacher.execute.mockResolvedValue({ id: 'gru-new' });

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [{ action: 'update', data: makeRow() as never }],
      };

      const result = await useCase.execute(dto);

      expect(mockCreateTeacher.execute).toHaveBeenCalledWith(
        expect.objectContaining({ employmentTypeId: 'employment-type-id' }),
      );
      expect(result).toEqual({ total: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('updates an existing teacher', async () => {
      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'gru-1',
            action: 'update',
            data: makeRow() as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(mockUpdateTeacher.execute).toHaveBeenCalledWith(
        'gru-1',
        expect.objectContaining({ employmentTypeId: 'employment-type-id' }),
      );
      expect(mockUpdateTeacherProfile.execute).toHaveBeenCalledWith(
        'gru-1',
        expect.objectContaining({ name: 'Budi Santoso' }),
      );
      expect(result).toEqual({ total: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('records the error and continues when update fails, instead of swallowing it', async () => {
      mockUpdateTeacher.execute.mockRejectedValue(
        new Error('Unexpected failure'),
      );

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'gru-1',
            action: 'update',
            data: makeRow() as never,
          },
        ],
      };

      const result = await useCase.execute(dto);

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors).toEqual([
        { existingId: 'gru-1', error: 'Unexpected failure' },
      ]);
    });

    it('resolves a repeated employment type code only once across conflicts', async () => {
      mockCreateTeacher.execute.mockResolvedValue({ id: 'gru-new' });

      const dto: ResolveBulkImportConflictsDto = {
        conflicts: [
          {
            existingId: 'gru-1',
            action: 'update',
            data: makeRow() as never,
          },
          {
            action: 'update',
            data: makeRow({
              nik: '9999000000000002',
              nip: '999',
              nuptk: '9999999999999999',
            }) as never,
          },
        ],
      };

      await useCase.execute(dto);

      expect(mockRepo.resolveEmploymentTypeId).toHaveBeenCalledTimes(1);
    });
  });
});
