import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateParentDto } from '../dto/update-parent.dto.js';
import { ParentRepository } from '../repositories/parent.repository.js';
import { UpdateParentUseCase } from './update-parent.use-case.js';

describe('UpdateParentUseCase', () => {
  let useCase: UpdateParentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findByNik: jest.fn(),
    findOccupationById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParentUseCase,
        { provide: ParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateParentUseCase>(UpdateParentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'par-1';
    const currentParent = {
      id: 'par-1',
      name: 'Budi Santoso',
      nik: '3578010101700001',
    };
    const activeOccupation = {
      id: 'occ-1',
      name: 'Wiraswasta',
      isActive: true,
    };

    it('should update a parent successfully (no NIK or occupation change)', async () => {
      const dto: UpdateParentDto = { name: 'Budi Santoso Updated' };
      const updated = { ...currentParent, name: 'Budi Santoso Updated' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByNik).not.toHaveBeenCalled();
      expect(mockRepo.findOccupationById).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should check NIK uniqueness when nik changes', async () => {
      const dto: UpdateParentDto = { nik: '3578010101700002' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.findByNik.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue({
        ...currentParent,
        nik: '3578010101700002',
      });

      await useCase.execute(id, dto);

      expect(mockRepo.findByNik).toHaveBeenCalledWith('3578010101700002', id);
    });

    it('should validate occupation when occupationId changes', async () => {
      const dto: UpdateParentDto = { occupationId: 'occ-new' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.findOccupationById.mockResolvedValue(activeOccupation);
      mockRepo.update.mockResolvedValue({
        ...currentParent,
        occupationId: 'occ-new',
      });

      await useCase.execute(id, dto);

      expect(mockRepo.findOccupationById).toHaveBeenCalledWith('occ-new');
    });

    it('should throw NotFoundException when parent is not found', async () => {
      const dto: UpdateParentDto = { name: 'Updated' };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new NIK is already taken', async () => {
      const dto: UpdateParentDto = { nik: '3578010101700099' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.findByNik.mockResolvedValue({ id: 'par-other' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when new occupation is not found', async () => {
      const dto: UpdateParentDto = { occupationId: 'occ-nonexistent' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.findOccupationById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new occupation is inactive', async () => {
      const dto: UpdateParentDto = { occupationId: 'occ-inactive' };

      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.findOccupationById.mockResolvedValue({
        ...activeOccupation,
        isActive: false,
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT check NIK when nik is absent from dto', async () => {
      const dto: UpdateParentDto = { name: 'Siti' };
      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.update.mockResolvedValue(currentParent);

      await useCase.execute(id, dto);

      expect(mockRepo.findByNik).not.toHaveBeenCalled();
    });

    it('should NOT check occupation when occupationId is absent from dto', async () => {
      const dto: UpdateParentDto = { name: 'Siti' };
      mockRepo.findById.mockResolvedValue(currentParent);
      mockRepo.update.mockResolvedValue(currentParent);

      await useCase.execute(id, dto);

      expect(mockRepo.findOccupationById).not.toHaveBeenCalled();
    });
  });
});
