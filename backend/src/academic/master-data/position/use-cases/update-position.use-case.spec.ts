import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePositionDto } from '../dto/request/update-position.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';
import { UpdatePositionUseCase } from './update-position.use-case.js';

describe('UpdatePositionUseCase', () => {
  let useCase: UpdatePositionUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePositionUseCase,
        { provide: IPositionRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdatePositionUseCase>(UpdatePositionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'pos-1';
    const currentPosition = {
      id: 'pos-1',
      name: 'Kepala Sekolah',
      categoryId: 'cat-management-uuid',
    };

    it('should update a position successfully (no name change)', async () => {
      const dto: UpdatePositionDto = { categoryId: 'cat-academic-uuid' };
      const updated = {
        ...currentPosition,
        categoryId: 'cat-academic-uuid',
      };

      mockRepo.findById.mockResolvedValue(currentPosition);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByName).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should check name uniqueness when name changes', async () => {
      const dto: UpdatePositionDto = { name: 'Wakil Kepala Sekolah' };

      mockRepo.findById.mockResolvedValue(currentPosition);
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue({
        ...currentPosition,
        name: 'Wakil Kepala Sekolah',
      });

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith(
        'Wakil Kepala Sekolah',
        id,
      );
    });

    it('should throw NotFoundException when position is not found', async () => {
      const dto: UpdatePositionDto = { name: 'Wakil Kepala Sekolah' };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is already taken', async () => {
      const dto: UpdatePositionDto = { name: 'Bendahara' };

      mockRepo.findById.mockResolvedValue(currentPosition);
      mockRepo.findByName.mockResolvedValue({ id: 'pos-other' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT call findByName when name is absent from dto', async () => {
      const dto: UpdatePositionDto = { categoryId: 'cat-finance-uuid' };

      mockRepo.findById.mockResolvedValue(currentPosition);
      mockRepo.update.mockResolvedValue(currentPosition);

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).not.toHaveBeenCalled();
    });
  });
});
