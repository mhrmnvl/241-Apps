import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PromotionSemesterResolver } from '../services/promotion-semester-resolver.service.js';
import { PreviewPromotionUseCase } from './preview-promotion.use-case.js';

describe('PreviewPromotionUseCase', () => {
  let useCase: PreviewPromotionUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findSemesterWithAcademicYear: jest.fn(),
    findEdgeSemesterOfAcademicYear: jest.fn(),
    findLatestEnrolledSemesterOfAcademicYear: jest.fn(),
    findAcademicYearName: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreviewPromotionUseCase,
        { provide: IPromotionRepository, useValue: mockRepository },
        PromotionSemesterResolver,
      ],
    }).compile();

    useCase = module.get(PreviewPromotionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return preview with student counts', () => {
    mockRepository.findLatestEnrolledSemesterOfAcademicYear.mockResolvedValue(
      sourceSemester,
    );
    mockRepository.findEdgeSemesterOfAcademicYear.mockResolvedValue(
      targetSemester,
    );

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
        {
          studentId: 'stu-2',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-8a',
          action: PromotionAction.PROMOTE,
        },
        {
          studentId: 'stu-3',
          sourceClassroomId: 'cls-9a',
          targetClassroomId: 'cls-9b',
          action: PromotionAction.REPEAT,
        },
      ],
    };

    const result = useCase.execute(dto);

    expect(result.totalStudents).toBe(3);
    expect(result.promotedCount).toBe(2);
    expect(result.repeatedCount).toBe(1);
    expect(result.items).toEqual(
      expect.arrayContaining([
        { action: PromotionAction.PROMOTE, studentCount: 2 },
        { action: PromotionAction.REPEAT, studentCount: 1 },
      ]),
    );
  });

  it('refuses one year twice', () => {
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

    expect(() => useCase.execute(dto)).toThrow(BadRequestException);
  });

  it('refuses both years being the same, and points at rollover', () => {
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

    expect(() => useCase.execute(dto)).toThrow(BadRequestException);
    // Settled before anything is read: naming one year twice is not a
    // question about semesters, so no semester is looked up to answer it.
    expect(
      mockRepository.findEdgeSemesterOfAcademicYear,
    ).not.toHaveBeenCalled();
  });

  /**
   * A preview counts up the decisions it was handed. Requiring either year to
   * have a term refused the one moment you most want a preview: while the year
   * ahead is still being set up.
   */
  it('previews a promotion into a year that has no term yet', () => {
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

    const result = useCase.execute(dto);

    expect(result.totalStudents).toBe(1);
    expect(
      mockRepository.findEdgeSemesterOfAcademicYear,
    ).not.toHaveBeenCalled();
  });
});
