import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PromotionSemesterResolver } from '../services/promotion-semester-resolver.service.js';
import { PromoteStudentsUseCase } from './promote-student.use-case.js';

describe('PromoteStudentsUseCase', () => {
  let useCase: PromoteStudentsUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findSemesterWithAcademicYear: jest.fn(),
    findEdgeSemesterOfAcademicYear: jest.fn(),
    findLatestEnrolledSemesterOfAcademicYear: jest.fn(),
    findAcademicYearName: jest.fn(),
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
        PromotionSemesterResolver,
      ],
    }).compile();

    useCase = module.get(PromoteStudentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should promote students successfully', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

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
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
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

  it('should handle repeat with decline reason', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

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
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
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

  /**
   * The state this school was actually in: a second term on the calendar with
   * nobody in it yet, because the rollover had not run. Refusing with "no
   * semester" would have been a lie — it has two.
   */
  it('refuses a source year whose terms are all empty, and says so', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      null,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findAcademicYearName.mockResolvedValue('2026/2027');

    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-1',
          targetClassroomId: 'cls-2',
          action: PromotionAction.PROMOTE,
        },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(/no students enrolled/i);
    await expect(useCase.execute(dto)).rejects.toThrow(/2026\/2027/);
  });

  it('refuses a source academic year that has no term to read from', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      null,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(null);
    mockRepository.findAcademicYearName.mockResolvedValue('2024/2025');

    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-1',
          targetClassroomId: 'cls-2',
          action: PromotionAction.PROMOTE,
        },
      ],
    };

    // A year without semesters is something the operator can fix, so it is a
    // bad request naming the year rather than a 404 on an id they never typed.
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('refuses both years being the same, and points at rollover', async () => {
    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-old',
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
    // Settled before anything is read: naming one year twice is not a
    // question about semesters, so no semester is looked up to answer it.
    expect(
      mockRepository.findEdgeSemesterOfAcademicYear,
    ).not.toHaveBeenCalled();
  });

  it('should throw if target classroom is in wrong AY', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-8a-wrong', 8, 'VIII', 'VIII-A', 'ay-old'),
      );

    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
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
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

    mockRepository.findClassroomById
      .mockResolvedValueOnce(
        makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
      )
      .mockResolvedValueOnce(
        makeClassroom('cls-8a', 8, 'VIII', 'VIII-A', 'ay-new'),
      );

    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
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

  /**
   * Replaces "GRADUATE must not carry a targetClassroomId". Graduation left
   * this flow, and with it the one action that had no destination — so a
   * missing target is now an error for every student in the run.
   */
  it('should throw if an action has no targetClassroomId', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

    mockRepository.findClassroomById.mockResolvedValueOnce(
      makeClassroom('cls-9a', 9, 'IX', 'IX-A', 'ay-old'),
    );

    // The DTO now requires a target classroom, so class-validator rejects
    // this shape before the use case ever sees it. The guard inside stays and
    // is asserted here anyway: the DTO is one caller's spelling of the rule,
    // and the write path dereferences the field without asking again.
    const dto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
      students: [
        {
          studentId: 'stu-1',
          sourceClassroomId: 'cls-9a',
          action: PromotionAction.PROMOTE,
        },
      ],
    } as unknown as PromotionDto;

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if REPEAT without declineReason', async () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

    mockRepository.findClassroomById.mockResolvedValueOnce(
      makeClassroom('cls-7a', 7, 'VII', 'VII-A', 'ay-old'),
    );

    const dto: PromotionDto = {
      sourceAcademicYearId: 'ay-old',
      targetAcademicYearId: 'ay-new',
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
