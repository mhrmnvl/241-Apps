import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEducationDto } from '../dto/request/update-education.dto.js';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';
import { UpdateEducationUseCase } from './update-education.use-case.js';

describe('UpdateEducationUseCase', () => {
  let useCase: UpdateEducationUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  const mockExisting = {
    id: 'edu-uuid-1',
    name: 'S1',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEducationUseCase,
        { provide: IEducationRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateEducationUseCase>(UpdateEducationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'edu-uuid-1';

    it('should update successfully when name is unique', async () => {
      const dto: UpdateEducationDto = { name: 'S2' };
      const updated = { ...mockExisting, name: 'S2' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.findByName).toHaveBeenCalledWith(dto.name, id);
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should skip name uniqueness check when name is not provided', async () => {
      const dto: UpdateEducationDto = { isActive: false };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.update.mockResolvedValue({
        ...mockExisting,
        isActive: false,
      });

      await useCase.execute(id, dto);

      expect(mockRepository.findByName).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
    });

    it('should throw NotFoundException when education not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, { name: 'S2' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name already exists', async () => {
      const dto: UpdateEducationDto = { name: 'S2' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.findByName.mockResolvedValue({
        id: 'other-id',
        name: 'S2',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
