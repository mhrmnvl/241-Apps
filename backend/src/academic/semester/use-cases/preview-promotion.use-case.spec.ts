import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PreviewPromotionUseCase } from './preview-promotion.use-case.js';

describe('PreviewPromotionUseCase', () => {
  let useCase: PreviewPromotionUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findSemesterWithAcademicYear: jest.fn(),
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
      ],
    }).compile();

    useCase = module.get(PreviewPromotionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return preview with student counts', async () => {
    mockRepository.findSemesterWithAcademicYear
      .mockResolvedValueOnce(sourceSemester)
      .mockResolvedValueOnce(targetSemester);

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
        {
          studentId: 'stu-2',
          sourceClassroomId: 'cls-7a',
          targetClassroomId: 'cls-8a',
          action: PromotionAction.PROMOTE,
        },
        {
          studentId: 'stu-3',
          sourceClassroomId: 'cls-9a',
          action: PromotionAction.GRADUATE,
        },
      ],
    };

    const result = await useCase.execute(dto);

    expect(result.totalStudents).toBe(3);
    expect(result.promotedCount).toBe(2);
    expect(result.graduatedCount).toBe(1);
    expect(result.repeatedCount).toBe(0);
    expect(result.items).toEqual(
      expect.arrayContaining([
        { action: PromotionAction.PROMOTE, studentCount: 2 },
        { action: PromotionAction.GRADUATE, studentCount: 1 },
      ]),
    );
  });

  it('should throw if source = target semester', async () => {
    const dto: PromotionDto = {
      sourceSemesterId: 'sem-1',
      targetSemesterId: 'sem-1',
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

  it('should throw if same academic year', async () => {
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
});
