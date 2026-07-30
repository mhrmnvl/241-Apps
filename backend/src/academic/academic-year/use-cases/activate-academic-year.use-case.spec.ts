import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { ActivateAcademicYearUseCase } from './activate-academic-year.use-case.js';

describe('ActivateAcademicYearUseCase', () => {
  let useCase: ActivateAcademicYearUseCase;

  const mockRepository = {
    findById: jest.fn(),
    activateById: jest.fn(),
    countSemesters: jest.fn(),
  };

  const inactiveYear = {
    id: 'ay-1',
    name: '2024/2025',
    isActive: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<ActivateAcademicYearUseCase>(
      ActivateAcademicYearUseCase,
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

    it('should return current if already active', async () => {
      const activeYear = { ...inactiveYear, isActive: true };
      mockRepository.findById.mockResolvedValue(activeYear);

      const result = await useCase.execute('ay-1');

      expect(result).toEqual(activeYear);
      expect(mockRepository.activateById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if academic year has no semesters', async () => {
      mockRepository.findById.mockResolvedValue(inactiveYear);
      mockRepository.countSemesters.mockResolvedValue(0);

      await expect(useCase.execute('ay-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.activateById).not.toHaveBeenCalled();
    });

    it('should activate using atomic activateById when it has semesters', async () => {
      const activatedYear = { ...inactiveYear, isActive: true };
      mockRepository.findById.mockResolvedValue(inactiveYear);
      mockRepository.countSemesters.mockResolvedValue(2);
      mockRepository.activateById.mockResolvedValue(activatedYear);

      const result = await useCase.execute('ay-1');

      expect(mockRepository.activateById).toHaveBeenCalledWith('ay-1');
      expect(result.isActive).toBe(true);
    });
  });
});
