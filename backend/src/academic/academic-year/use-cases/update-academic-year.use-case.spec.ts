import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAcademicYearDto } from '../dto/request/update-academic-year.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { UpdateAcademicYearUseCase } from './update-academic-year.use-case.js';

describe('UpdateAcademicYearUseCase', () => {
  let useCase: UpdateAcademicYearUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateAcademicYearUseCase>(UpdateAcademicYearUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ay-1';
    const currentYear = { id: 'ay-1', name: '2024/2025', isActive: false };

    it('should update an academic year successfully', async () => {
      const dto: UpdateAcademicYearDto = { name: '2025/2026' };
      const updatedYear = { ...currentYear, name: '2025/2026' };

      mockRepository.findById.mockResolvedValue(currentYear);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedYear);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.findByName).toHaveBeenCalledWith('2025/2026');
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updatedYear);
    });

    it('should throw NotFoundException when ID not found', async () => {
      const dto: UpdateAcademicYearDto = { name: '2025/2026' };
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is taken', async () => {
      const dto: UpdateAcademicYearDto = { name: 'Taken Name' };
      mockRepository.findById.mockResolvedValue(currentYear);
      mockRepository.findByName.mockResolvedValue({
        id: 'other-id',
        name: 'Taken Name',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should skip name uniqueness check when name is unchanged', async () => {
      const dto: UpdateAcademicYearDto = { name: '2024/2025' };
      mockRepository.findById.mockResolvedValue(currentYear);
      mockRepository.update.mockResolvedValue(currentYear);

      await useCase.execute(id, dto);

      expect(mockRepository.findByName).not.toHaveBeenCalled();
    });
  });
});
