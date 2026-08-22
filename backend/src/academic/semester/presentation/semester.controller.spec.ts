import { Test, TestingModule } from '@nestjs/testing';
import { CreateSemesterDto } from '../dto/request/create-semester.dto.js';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { ActivateSemesterUseCase } from '../use-cases/activate-semester.use-case.js';
import { CreateSemesterUseCase } from '../use-cases/create-semester.use-case.js';
import { DeactivateSemesterUseCase } from '../use-cases/deactivate-semester.use-case.js';
import { DeleteSemesterUseCase } from '../use-cases/delete-semester.use-case.js';
import { GeneratePromotionRecommendationUseCase } from '../use-cases/generate-promotion-recommendation.use-case.js';
import { GetSemesterByIdUseCase } from '../use-cases/get-semester-by-id.use-case.js';
import { GetSemestersUseCase } from '../use-cases/get-semesters.use-case.js';
import { PreviewPromotionUseCase } from '../use-cases/preview-promotion.use-case.js';
import { PromoteStudentsUseCase } from '../use-cases/promote-student.use-case.js';
import { RolloverSemesterUseCase } from '../use-cases/rollover-semester.use-case.js';
import { UpdateSemesterUseCase } from '../use-cases/update-semester.use-case.js';
import { SemesterController } from './semester.controller.js';
import { SemesterRolloverController } from './semester-rollover.controller.js';
import { SemesterPromotionController } from './semester-promotion.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('Semester Controllers', () => {
  let controller: SemesterController;
  let rolloverController: SemesterRolloverController;
  let promotionController: SemesterPromotionController;

  const mockGetSemesters = { execute: jest.fn() };
  const mockGetSemesterById = { execute: jest.fn() };
  const mockCreateSemester = { execute: jest.fn() };
  const mockUpdateSemester = { execute: jest.fn() };
  const mockDeleteSemester = { execute: jest.fn() };
  const mockRolloverSemester = { execute: jest.fn() };
  const mockPromoteStudents = { execute: jest.fn() };
  const mockPreviewPromotion = { execute: jest.fn() };
  const mockGenerateRecommendation = { execute: jest.fn() };
  const mockActivateSemester = { execute: jest.fn() };
  const mockDeactivateSemester = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SemesterRolloverController,
        SemesterPromotionController,
        SemesterController,
      ],
      providers: [
        { provide: GetSemestersUseCase, useValue: mockGetSemesters },
        { provide: GetSemesterByIdUseCase, useValue: mockGetSemesterById },
        { provide: CreateSemesterUseCase, useValue: mockCreateSemester },
        { provide: UpdateSemesterUseCase, useValue: mockUpdateSemester },
        { provide: DeleteSemesterUseCase, useValue: mockDeleteSemester },
        { provide: RolloverSemesterUseCase, useValue: mockRolloverSemester },
        { provide: PromoteStudentsUseCase, useValue: mockPromoteStudents },
        {
          provide: PreviewPromotionUseCase,
          useValue: mockPreviewPromotion,
        },
        {
          provide: GeneratePromotionRecommendationUseCase,
          useValue: mockGenerateRecommendation,
        },
        { provide: ActivateSemesterUseCase, useValue: mockActivateSemester },
        {
          provide: DeactivateSemesterUseCase,
          useValue: mockDeactivateSemester,
        },
      ],
    }).compile();

    controller = module.get<SemesterController>(SemesterController);
    rolloverController = module.get<SemesterRolloverController>(
      SemesterRolloverController,
    );
    promotionController = module.get<SemesterPromotionController>(
      SemesterPromotionController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(rolloverController).toBeDefined();
    expect(promotionController).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetSemestersUseCase', async () => {
      const query = { page: 1, limit: 10 };
      mockGetSemesters.execute.mockResolvedValue({ data: [] });

      await controller.findAll(query);

      expect(mockGetSemesters.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetSemesterByIdUseCase', async () => {
      mockGetSemesterById.execute.mockResolvedValue({ id: 'sem-1' });

      const result = await controller.findOne('sem-1');

      expect(mockGetSemesterById.execute).toHaveBeenCalledWith('sem-1');
      expect(result).toEqual({ id: 'sem-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateSemesterUseCase', async () => {
      const dto: CreateSemesterDto = {
        academicYearId: 'ay-1',
        typeId: 'type-odd',
      };
      mockCreateSemester.execute.mockResolvedValue({ id: 'new' });

      await controller.create(dto);

      expect(mockCreateSemester.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateSemesterUseCase', async () => {
      mockUpdateSemester.execute.mockResolvedValue({ id: 'sem-1' });

      await controller.update('sem-1', {
        startDate: '2026-01-01',
      });

      expect(mockUpdateSemester.execute).toHaveBeenCalledWith('sem-1', {
        startDate: '2026-01-01',
      });
    });
  });

  describe('rollover', () => {
    it('should delegate to RolloverSemesterUseCase', async () => {
      const dto = { sourceSemesterId: 'sem-1', targetSemesterId: 'sem-2' };
      mockRolloverSemester.execute.mockResolvedValue({
        classrooms: { created: 5, skipped: 0 },
      });

      await rolloverController.rollover(dto);

      expect(mockRolloverSemester.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('promote', () => {
    it('should delegate to PromoteStudentsUseCase', async () => {
      const dto = {
        sourceAcademicYearId: 'ay-2025',
        targetAcademicYearId: 'ay-2026',
        students: [
          {
            studentId: 'stu-1',
            sourceClassroomId: 'cls-1',
            targetClassroomId: 'cls-2',
            action: PromotionAction.PROMOTE,
          },
        ],
      };
      mockPromoteStudents.execute.mockResolvedValue({
        promoted: 1,
        repeated: 0,
        graduated: 0,
        skipped: 0,
      });

      await promotionController.promote(dto);

      expect(mockPromoteStudents.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('previewPromotion', () => {
    it('should delegate to PreviewPromotionUseCase', async () => {
      const dto = {
        sourceAcademicYearId: 'ay-2025',
        targetAcademicYearId: 'ay-2026',
        students: [
          {
            studentId: 'stu-1',
            sourceClassroomId: 'cls-1',
            targetClassroomId: 'cls-2',
            action: PromotionAction.PROMOTE,
          },
        ],
      };
      mockPreviewPromotion.execute.mockResolvedValue({
        items: [],
        totalStudents: 0,
        promotedCount: 0,
        repeatedCount: 0,
      });

      await promotionController.previewPromotion(dto);

      expect(mockPreviewPromotion.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('recommend', () => {
    it('should delegate to GeneratePromotionRecommendationUseCase', async () => {
      const dto = {
        sourceAcademicYearId: 'ay-2025',
        targetAcademicYearId: 'ay-2026',
      };
      mockGenerateRecommendation.execute.mockResolvedValue({
        items: [],
        totalStudents: 0,
      });

      await promotionController.recommend(dto);

      expect(mockGenerateRecommendation.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteSemesterUseCase', async () => {
      mockDeleteSemester.execute.mockResolvedValue(undefined);

      await controller.remove('sem-1');

      expect(mockDeleteSemester.execute).toHaveBeenCalledWith('sem-1');
    });
  });

  describe('activate', () => {
    it('should delegate to ActivateSemesterUseCase with id', async () => {
      const expected = { id: 'sem-1', isActive: true };
      mockActivateSemester.execute.mockResolvedValue(expected);

      const result = await controller.activate('sem-1');

      expect(mockActivateSemester.execute).toHaveBeenCalledWith('sem-1');
      expect(result).toEqual(expected);
    });
  });

  describe('deactivate', () => {
    it('should delegate to DeactivateSemesterUseCase with id', async () => {
      const expected = { id: 'sem-1', isActive: false };
      mockDeactivateSemester.execute.mockResolvedValue(expected);

      const result = await controller.deactivate('sem-1');

      expect(mockDeactivateSemester.execute).toHaveBeenCalledWith('sem-1');
      expect(result).toEqual(expected);
    });
  });
});
