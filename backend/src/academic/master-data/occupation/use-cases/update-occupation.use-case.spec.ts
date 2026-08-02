import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOccupationDto } from '../dto/request/update-occupation.dto.js';
import { IOccupationRepository } from '../domain/interfaces/occupation-repository.interface.js';
import { UpdateOccupationUseCase } from './update-occupation.use-case.js';

describe('UpdateOccupationUseCase', () => {
  let useCase: UpdateOccupationUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOccupationUseCase,
        { provide: IOccupationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateOccupationUseCase>(UpdateOccupationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'occ-1';
    const currentOccupation = { id: 'occ-1', name: 'Wiraswasta' };

    it('should update an occupation successfully (no name change)', async () => {
      const dto: UpdateOccupationDto = { isActive: false };
      const updated = { ...currentOccupation, isActive: false };

      mockRepo.findById.mockResolvedValue(currentOccupation);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByName).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should check uniqueness when name changes', async () => {
      const dto: UpdateOccupationDto = { name: 'PNS' };

      mockRepo.findById.mockResolvedValue(currentOccupation);
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue({ ...currentOccupation, name: 'PNS' });

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith('PNS', id);
    });

    it('should throw NotFoundException when occupation is not found', async () => {
      const dto: UpdateOccupationDto = { name: 'PNS' };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is already taken', async () => {
      const dto: UpdateOccupationDto = { name: 'PNS' };

      mockRepo.findById.mockResolvedValue(currentOccupation);
      mockRepo.findByName.mockResolvedValue({ id: 'occ-other' });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT call findByName when name is not in dto', async () => {
      const dto: UpdateOccupationDto = { isActive: true };

      mockRepo.findById.mockResolvedValue(currentOccupation);
      mockRepo.update.mockResolvedValue(currentOccupation);

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).not.toHaveBeenCalled();
    });
  });
});
