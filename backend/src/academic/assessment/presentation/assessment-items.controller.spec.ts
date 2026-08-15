import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentType } from '../../../shared/domain/enums/assessment-type.enum.js';
import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';
import { GetAssessmentItemsUseCase } from '../use-cases/get-assessment-items.use-case.js';
import { GetAssessmentItemByIdUseCase } from '../use-cases/get-assessment-item-by-id.use-case.js';
import { CreateAssessmentItemUseCase } from '../use-cases/create-assessment-item.use-case.js';
import { UpdateAssessmentItemUseCase } from '../use-cases/update-assessment-item.use-case.js';
import { DeleteAssessmentItemUseCase } from '../use-cases/delete-assessment-item.use-case.js';
import { AssessmentItemController } from './assessment-item.controller.js';

describe('AssessmentItemController', () => {
  let controller: AssessmentItemController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentItemController],
      providers: [
        { provide: GetAssessmentItemsUseCase, useValue: mockGetAll },
        { provide: GetAssessmentItemByIdUseCase, useValue: mockGetById },
        { provide: CreateAssessmentItemUseCase, useValue: mockCreate },
        { provide: UpdateAssessmentItemUseCase, useValue: mockUpdate },
        { provide: DeleteAssessmentItemUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<AssessmentItemController>(AssessmentItemController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAssessmentItemsUseCase', async () => {
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
    it('should delegate to GetAssessmentItemByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'ai-1' });
      const result = await controller.findOne('ai-1');
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
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAssessmentItemUseCase', async () => {
      const dto: UpdateAssessmentItemDto = { name: 'UAS' };
      mockUpdate.execute.mockResolvedValue({ id: 'ai-1' });
      await controller.update('ai-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('ai-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAssessmentItemUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('ai-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('ai-1');
    });
  });
});
