import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolloverSemesterDto } from '../dto/rollover-semester.dto.js';
import { IRolloverRepository } from '../domain/interfaces/rollover-repository.interface.js';
import { RolloverSemesterUseCase } from './rollover-semester.use-case.js';

describe('RolloverSemesterUseCase', () => {
  let useCase: RolloverSemesterUseCase;

  const mockRolloverRepo = {
    findSemesterWithAcademicYear: jest.fn(),
    fetchSourceData: jest.fn(),
    executeRollover: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolloverSemesterUseCase,
        { provide: IRolloverRepository, useValue: mockRolloverRepo },
      ],
    }).compile();

    useCase = module.get<RolloverSemesterUseCase>(RolloverSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const sourceSemester = {
      id: 'sem-source',
      academicYearId: 'ay-1',
      typeId: 'type-odd',
      academicYear: { id: 'ay-1', name: '2025/2026' },
    };

    const targetSemester = {
      id: 'sem-target',
      academicYearId: 'ay-1',
      typeId: 'type-even',
      academicYear: { id: 'ay-1', name: '2025/2026' },
    };

    const dto: RolloverSemesterDto = {
      sourceSemesterId: 'sem-source',
      targetSemesterId: 'sem-target',
    };

    const emptySourceData = {
      classrooms: [],
      enrollments: [],
      supervisors: [],
      assignments: [],
    };

    const defaultSummary = {
      classrooms: { created: 0, skipped: 0 },
      enrollments: { created: 0, skipped: 0 },
      supervisors: { created: 0, skipped: 0 },
      teachingAssignments: { created: 0, skipped: 0 },
      schedules: { created: 0, skipped: 0 },
    };

    it('should throw BadRequestException when source equals target', async () => {
      const sameDto: RolloverSemesterDto = {
        sourceSemesterId: 'sem-1',
        targetSemesterId: 'sem-1',
      };

      await expect(useCase.execute(sameDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when source semester not found', async () => {
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(targetSemester);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when target semester not found', async () => {
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(sourceSemester)
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when semesters are in different academic years', async () => {
      const crossAyTarget = {
        id: 'sem-target',
        academicYearId: 'ay-2',
        typeId: 'type-odd',
        academicYear: { id: 'ay-2', name: '2026/2027' },
      };
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(sourceSemester)
        .mockResolvedValueOnce(crossAyTarget);

      await expect(
        useCase.execute({
          sourceSemesterId: 'sem-source',
          targetSemesterId: 'sem-target',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when semesters have the same type', async () => {
      const sameTypeTarget = {
        id: 'sem-target',
        academicYearId: 'ay-1',
        typeId: 'type-odd',
        academicYear: { id: 'ay-1', name: '2025/2026' },
      };
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(sourceSemester)
        .mockResolvedValueOnce(sameTypeTarget);

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });

    it('should rollover successfully', async () => {
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(sourceSemester)
        .mockResolvedValueOnce(targetSemester);

      const sourceData = {
        classrooms: [{ id: 'cls-1' }],
        enrollments: [{ id: 'enr-1' }],
        supervisors: [{ id: 'sup-1' }],
        assignments: [{ id: 'ta-1' }],
      };

      const summary = {
        classrooms: { created: 1, skipped: 0 },
        enrollments: { created: 1, skipped: 0 },
        supervisors: { created: 1, skipped: 0 },
        teachingAssignments: { created: 1, skipped: 0 },
        schedules: { created: 1, skipped: 0 },
      };

      mockRolloverRepo.fetchSourceData.mockResolvedValue(sourceData);
      mockRolloverRepo.executeRollover.mockResolvedValue(summary);

      const result = await useCase.execute(dto);

      expect(mockRolloverRepo.fetchSourceData).toHaveBeenCalledWith(
        'sem-source',
        'ay-1',
      );
      expect(mockRolloverRepo.executeRollover).toHaveBeenCalledWith(
        sourceData,
        'sem-target',
        'ay-1',
      );
      expect(result.classrooms.created).toBe(1);
      expect(result.enrollments.created).toBe(1);
      expect(result.supervisors.created).toBe(1);
      expect(result.teachingAssignments.created).toBe(1);
      expect(result.schedules.created).toBe(1);
    });

    it('should handle empty source data gracefully', async () => {
      mockRolloverRepo.findSemesterWithAcademicYear
        .mockResolvedValueOnce(sourceSemester)
        .mockResolvedValueOnce(targetSemester);

      mockRolloverRepo.fetchSourceData.mockResolvedValue(emptySourceData);
      mockRolloverRepo.executeRollover.mockResolvedValue(defaultSummary);

      const result = await useCase.execute(dto);

      expect(result.classrooms.created).toBe(0);
      expect(result.classrooms.skipped).toBe(0);
      expect(result.enrollments.created).toBe(0);
      expect(result.supervisors.created).toBe(0);
      expect(result.teachingAssignments.created).toBe(0);
      expect(result.schedules.created).toBe(0);
    });
  });
});
