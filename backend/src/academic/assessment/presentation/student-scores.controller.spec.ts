import { Test, TestingModule } from '@nestjs/testing';
import { CreateStudentScoreDto } from '../dto/request/create-student-score.dto.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';
import { GetStudentScoresUseCase } from '../use-cases/get-student-scores.use-case.js';
import { GetMyStudentScoresUseCase } from '../use-cases/get-my-student-scores.use-case.js';
import { GetStudentScoreByIdUseCase } from '../use-cases/get-student-score-by-id.use-case.js';
import { CreateStudentScoreUseCase } from '../use-cases/create-student-score.use-case.js';
import { UpdateStudentScoreUseCase } from '../use-cases/update-student-score.use-case.js';
import { DeleteStudentScoreUseCase } from '../use-cases/delete-student-score.use-case.js';
import { GetStudentScoreRosterUseCase } from '../use-cases/get-student-score-roster.use-case.js';
import { BulkUpsertStudentScoresUseCase } from '../use-cases/bulk-upsert-student-scores.use-case.js';
import { GradeAssignedStudentScoresUseCase } from '../use-cases/grade-assigned-student-scores.use-case.js';
import { StudentScoreController } from './student-score.controller.js';

describe('StudentScoreController', () => {
  let controller: StudentScoreController;
  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockRoster = { execute: jest.fn() };
  const mockBulkUpsert = { execute: jest.fn() };
  const mockGradeAssigned = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentScoreController],
      providers: [
        { provide: GetStudentScoresUseCase, useValue: mockGetAll },
        {
          provide: GetMyStudentScoresUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: GetStudentScoreByIdUseCase, useValue: mockGetById },
        { provide: CreateStudentScoreUseCase, useValue: mockCreate },
        { provide: UpdateStudentScoreUseCase, useValue: mockUpdate },
        { provide: DeleteStudentScoreUseCase, useValue: mockDelete },
        { provide: GetStudentScoreRosterUseCase, useValue: mockRoster },
        { provide: BulkUpsertStudentScoresUseCase, useValue: mockBulkUpsert },
        {
          provide: GradeAssignedStudentScoresUseCase,
          useValue: mockGradeAssigned,
        },
      ],
    }).compile();
    controller = module.get<StudentScoreController>(StudentScoreController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'ss-1' });
      const result = await controller.findOne('ss-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('ss-1');
      expect(result).toEqual({ id: 'ss-1' });
    });
  });

  describe('create', () => {
    it('should delegate', async () => {
      const dto: CreateStudentScoreDto = {
        enrollmentId: 'e1',
        assessmentItemId: 'a1',
        score: 85,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate', async () => {
      const dto: UpdateStudentScoreDto = { score: 90 };
      mockUpdate.execute.mockResolvedValue({ id: 'ss-1' });
      await controller.update('ss-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('ss-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('ss-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('ss-1');
    });
  });

  describe('getRoster', () => {
    it('should delegate', async () => {
      const query: StudentScoreRosterQueryDto = { assessmentItemId: 'ai-1' };
      mockRoster.execute.mockResolvedValue({ assessmentItem: {}, items: [] });
      const result = await controller.getRoster(query);
      expect(mockRoster.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ assessmentItem: {}, items: [] });
    });
  });

  describe('bulkUpsert', () => {
    it('should delegate', async () => {
      const dto: BulkUpsertStudentScoreDto = {
        assessmentItemId: 'ai-1',
        records: [{ enrollmentId: 'e1', score: 85 }],
      };
      mockBulkUpsert.execute.mockResolvedValue({ saved: 1 });
      const result = await controller.bulkUpsert(dto);
      expect(mockBulkUpsert.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ saved: 1 });
    });
  });
});
