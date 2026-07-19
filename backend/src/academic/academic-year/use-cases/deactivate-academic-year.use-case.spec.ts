import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { DeactivateAcademicYearUseCase } from './deactivate-academic-year.use-case.js';

describe('DeactivateAcademicYearUseCase', () => {
  let useCase: DeactivateAcademicYearUseCase;

  const mockRepository = {
    findById: jest.fn(),
    hasRelatedData: jest.fn(),
    update: jest.fn(),
    countActive: jest.fn(),
    deactivateSemestersByAcademicYearId: jest.fn(),
  };

  const activeYear = {
    id: 'ay-1',
    name: '2024/2025',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeactivateAcademicYearUseCase>(
      DeactivateAcademicYearUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('ay-1')).rejects.toThrow(NotFoundException);
    });

    it('should return current if already inactive', async () => {
      const inactiveYear = { ...activeYear, isActive: false };
      mockRepository.findById.mockResolvedValue(inactiveYear);

      const result = await useCase.execute('ay-1');

      expect(result).toEqual(inactiveYear);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if it is the only active academic year', async () => {
      mockRepository.findById.mockResolvedValue(activeYear);
      mockRepository.countActive.mockResolvedValue(1);

      await expect(useCase.execute('ay-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should deactivate an active academic year and cascade deactivate semesters', async () => {
      const deactivatedYear = { ...activeYear, isActive: false };
      mockRepository.findById.mockResolvedValue(activeYear);
      mockRepository.countActive.mockResolvedValue(2);
      mockRepository.hasRelatedData.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue(deactivatedYear);
      mockRepository.deactivateSemestersByAcademicYearId.mockResolvedValue({
        count: 2,
      });

      const result = await useCase.execute('ay-1');

      expect(mockRepository.update).toHaveBeenCalledWith('ay-1', {
        isActive: false,
      });
      expect(
        mockRepository.deactivateSemestersByAcademicYearId,
      ).toHaveBeenCalledWith('ay-1');
      expect(result.isActive).toBe(false);
    });

    it('should still deactivate even with related data (with warning)', async () => {
      const deactivatedYear = { ...activeYear, isActive: false };
      mockRepository.findById.mockResolvedValue(activeYear);
      mockRepository.countActive.mockResolvedValue(2);
      mockRepository.hasRelatedData.mockResolvedValue(true);
      mockRepository.update.mockResolvedValue(deactivatedYear);
      mockRepository.deactivateSemestersByAcademicYearId.mockResolvedValue({
        count: 0,
      });

      const result = await useCase.execute('ay-1');

      expect(result.isActive).toBe(false);
    });
  });
});
