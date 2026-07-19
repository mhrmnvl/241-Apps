import { Test, TestingModule } from '@nestjs/testing';
import { CreateAchievementDto } from '../dto/create-achievement.dto.js';
import { UpdateAchievementDto } from '../dto/update-achievement.dto.js';
import { CreateAchievementUseCase } from '../use-cases/create-achievement.use-case.js';
import { GetAchievementsUseCase } from '../use-cases/get-achievements.use-case.js';
import { GetAchievementByIdUseCase } from '../use-cases/get-achievement-by-id.use-case.js';
import { UpdateAchievementUseCase } from '../use-cases/update-achievement.use-case.js';
import { DeleteAchievementUseCase } from '../use-cases/delete-achievement.use-case.js';
import { AchievementController } from './achievement.controller.js';

describe('AchievementController', () => {
  let controller: AchievementController;

  const mockCreate = { execute: jest.fn() };
  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementController],
      providers: [
        { provide: CreateAchievementUseCase, useValue: mockCreate },
        { provide: GetAchievementsUseCase, useValue: mockGetAll },
        { provide: GetAchievementByIdUseCase, useValue: mockGetById },
        { provide: UpdateAchievementUseCase, useValue: mockUpdate },
        { provide: DeleteAchievementUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<AchievementController>(AchievementController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAchievementsUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetAchievementByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'ach-1' });
      const result = await controller.findOne('ach-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('ach-1');
      expect(result).toEqual({ id: 'ach-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateAchievementUseCase', async () => {
      const dto: CreateAchievementDto = {
        profileId: 'prof-1',
        name: 'Olimpiade Matematika',
        level: 'Juara 1',
        typeId: 'achievement-type-uuid',
        year: 2024,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAchievementUseCase', async () => {
      const dto: UpdateAchievementDto = { name: 'Updated' };
      mockUpdate.execute.mockResolvedValue({ id: 'ach-1' });
      await controller.update('ach-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('ach-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAchievementUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('ach-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('ach-1');
    });
  });
});
