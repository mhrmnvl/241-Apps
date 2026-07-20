import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAction, PromotionDto } from '../dto/request/promotion.dto.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PromoteStudentsUseCase } from './promote-student.use-case.js';

describe('PromoteStudentsUseCase', () => {
  let useCase: PromoteStudentsUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findSemesterWithAcademicYear: jest.fn(),
    findClassroomById: jest.fn(),
    executePromotion: jest.fn(),
  };

  const sourceSemester = {
    id: 'sem-src',
    type: 'EVEN',
    academicYearId: 'ay-old',
    academicYear: { id: 'ay-old', name: '2024/2025' },
  };

  const targetSemester = {
    id: 'sem-tgt',
    type: 'ODD',
    academicYearId: 'ay-new',
    academicYear: { id: 'ay-new', name: '2025/2026' },
  };

  const makeClassroom = (
    id: string,
    level: number,
    levelName: string,
    code: string,
    ayId: string,
  ) => ({
    id,
    code,
    name: code,
    gradeId: `lvl-${level}`,
    grade: { level, name: levelName },
    academicYearId: ayId,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoteStudentsUseCase,
        { provide: IPromotionRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(PromoteStudentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should promote students successfully', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-8a', 8, 'VIII', 'VIII-A', 'ay-new'),
      );

    mockRepository.executePromotion.mockResolvedValue({
      promoted: 1,
      repeated: 0,
      graduated: 0,
      skipped: 0,
    });

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-8a',
          action: PromotionAction.PROMOTE,
        },
      ],
    };

    const result = await useCase.execute(dto);
    expect(result.promoted).toBe(1);
    expect(mockRepository.executePromotion).toHaveBeenCalledWith(
      'sem-src',
      'sem-tgt',
      dto.students,
    );
  });

  it('should graduate students successfully', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById.mockResolvedValueOnce(
      makeClassroom('cls-9a', 9, 'IX', 'IX-A', 'ay-old'),
    );

    mockRepository.executePromotion.mockResolvedValue({
      promoted: 0,
      repeated: 0,
      graduated: 1,
      skipped: 0,
    });

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-9a',
          action: PromotionAction.GRADUATE,
        },
      ],
    };

    const result = await useCase.execute(dto);
    expect(result.graduated).toBe(1);
  });

  it('should handle repeat with decline reason', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a-old', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-7a-new', 7, 'VII', 'VII-A', 'ay-new'),
      );

    mockRepository.executePromotion.mockResolvedValue({
      promoted: 0,
      repeated: 1,
      graduated: 0,
      skipped: 0,
    });

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-7a-old',
          targetClassroomId: 'cls-7a-new',
          action: PromotionAction.REPEAT,
          declineReason: 'Nilai di bawah rata-rata',
        },
      ],
    };

    const result = await useCase.execute(dto);
    expect(result.repeated).toBe(1);
  });

  it('should throw if source = target semester', async () => {
    const dto: PromotionDto = {
      sourceSemesterId: 'sem-1',
      targetSemesterId: 'sem-1',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-1',
          targetClassroomId: 'cls-2',
          action: PromotionAction.PROMOTE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if source semester not found', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(targetSemester);

    const dto: PromotionDto = {
      sourceSemesterId: 'not-found',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-1',
          action: PromotionAction.GRADUATE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw if same academic year (use rollover instead)', async () => {
    const sameAySemester = { ...targetSemester, academicYearId: 'ay-old' };
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(sameAySemester);

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-1',
          action: PromotionAction.GRADUATE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if target classroom is in wrong AY', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-8a-wrong', 8, 'VIII', 'VIII-A', 'ay-old'),
      );

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-8a-wrong',
          action: PromotionAction.PROMOTE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if REPEAT with level mismatch', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-8a', 8, 'VIII', 'VIII-A', 'ay-new'),
      );

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-8a',
          action: PromotionAction.REPEAT,
          declineReason: 'Nilai rendah',
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if GRADUATE has targetClassroomId', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById.mockResolvedValueOnce(
      makeClassroom('cls-9a', 9, 'IX', 'IX-A', 'ay-old'),
    );

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-9a',
          targetClassroomId: 'cls-8a',
          action: PromotionAction.GRADUATE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if REPEAT without declineReason', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

    mockRepository.findClassroomById.mockResolvedValueOnce(
      makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
    );

    const dto: PromotionDto = {
      sourceSemesterId: 'sem-src',
      targetSemesterId: 'sem-tgt',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-7a-new',
          action: PromotionAction.REPEAT,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });
});
