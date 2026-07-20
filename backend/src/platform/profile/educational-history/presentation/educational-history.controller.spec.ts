import { Test, TestingModule } from '@nestjs/testing';
import { CreateEducationalHistoryDto } from '../dto/request/create-educational-history.dto.js';
import { UpdateEducationalHistoryDto } from '../dto/request/update-educational-history.dto.js';
import { CreateEducationalHistoryUseCase } from '../use-cases/create-educational-history.use-case.js';
import { DeleteEducationalHistoryUseCase } from '../use-cases/delete-educational-history.use-case.js';
import { GetEducationalHistoriesUseCase } from '../use-cases/get-educational-histories.use-case.js';
import { GetEducationalHistoryByIdUseCase } from '../use-cases/get-educational-history-by-id.use-case.js';
import { UpdateEducationalHistoryUseCase } from '../use-cases/update-educational-history.use-case.js';
import { EducationalHistoryController } from './educational-history.controller.js';

describe('EducationalHistoryController', () => {
  let controller: EducationalHistoryController;

  const mockCreate = { execute: jest.fn() };
  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationalHistoryController],
      providers: [
        { provide: CreateEducationalHistoryUseCase, useValue: mockCreate },
        { provide: GetEducationalHistoriesUseCase, useValue: mockGetAll },
        { provide: GetEducationalHistoryByIdUseCase, useValue: mockGetById },
        { provide: UpdateEducationalHistoryUseCase, useValue: mockUpdate },
        { provide: DeleteEducationalHistoryUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<EducationalHistoryController>(
      EducationalHistoryController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetEducationalHistoriesUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetEducationalHistoryByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'eh-1' });
      const result = await controller.findOne('eh-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('eh-1');
      expect(result).toEqual({ id: 'eh-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateEducationalHistoryUseCase', async () => {
      const dto: CreateEducationalHistoryDto = {
        profileId: 'prof-1',
        level: 'SMA',
        institution: 'SMAN 1 Malang',
        startYear: 2018,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateEducationalHistoryUseCase', async () => {
      const dto: UpdateEducationalHistoryDto = { institution: 'Updated' };
      mockUpdate.execute.mockResolvedValue({ id: 'eh-1' });
      await controller.update('eh-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('eh-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteEducationalHistoryUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('eh-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('eh-1');
    });
  });
});
