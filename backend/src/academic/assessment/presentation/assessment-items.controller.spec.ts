import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentType } from '@prisma/client';
import {
  CreateAssessmentItemDto,
  UpdateAssessmentItemDto,
} from '../dto/assessment-item.dto.js';
import {
  CreateAssessmentItemUseCase,
  DeleteAssessmentItemUseCase,
  GetAssessmentItemByIdUseCase,
  GetAssessmentItemsUseCase,
  UpdateAssessmentItemUseCase,
} from '../use-cases/assessment-item.use-case.js';
import { AssessmentItemsController } from './assessment-items.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('AssessmentItemsController', () => {
  let controller: AssessmentItemsController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentItemsController],
      providers: [
        { provide: GetAssessmentItemsUseCase, useValue: mockGetAll },
        { provide: GetAssessmentItemByIdUseCase, useValue: mockGetById },
        { provide: CreateAssessmentItemUseCase, useValue: mockCreate },
        { provide: UpdateAssessmentItemUseCase, useValue: mockUpdate },
        { provide: DeleteAssessmentItemUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<AssessmentItemsController>(
      AssessmentItemsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAssessmentItemsUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(mockUser, { page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetAssessmentItemByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'ai-1' });
      const result = await controller.findOne(mockUser, 'ai-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('ai-1');
      expect(result).toEqual({ id: 'ai-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateAssessmentItemUseCase', async () => {
      const dto: CreateAssessmentItemDto = {
        teachingAssignmentId: 'ta-1',
        name: 'UTS',
        type: AssessmentType.DAILY,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(mockUser, dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAssessmentItemUseCase', async () => {
      const dto: UpdateAssessmentItemDto = { name: 'UAS' };
      mockUpdate.execute.mockResolvedValue({ id: 'ai-1' });
      await controller.update(mockUser, 'ai-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('ai-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAssessmentItemUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'ai-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('ai-1');
    });
  });
});
