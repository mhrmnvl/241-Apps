import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { ActivateSemesterUseCase } from './activate-semester.use-case.js';

describe('ActivateSemesterUseCase', () => {
  let useCase: ActivateSemesterUseCase;

  const mockRepository = {
    findById: jest.fn(),
    activateById: jest.fn(),
  };

  const mockAcademicYearsRepository = {
    findById: jest.fn(),
  };

  const inactiveSemester = {
    id: 'sem-1',
    type: 'ODD',
    isActive: false,
    academicYear: { id: 'ay-1', name: '2024/2025' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateSemesterUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
        {
          provide: IAcademicYearRepository,
          useValue: mockAcademicYearsRepository,
        },
      ],
    }).compile();

    useCase = module.get<ActivateSemesterUseCase>(ActivateSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return current if already active', async () => {
      const activeSemester = { ...inactiveSemester, isActive: true };
      mockRepository.findById.mockResolvedValue(activeSemester);

      const result = await useCase.execute('sem-1');

      expect(result).toEqual(activeSemester);
      expect(mockRepository.activateById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when academic year is not active', async () => {
      mockRepository.findById.mockResolvedValue(inactiveSemester);
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        isActive: false,
      });

      await expect(useCase.execute('sem-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should activate using atomic activateById', async () => {
      const activatedSemester = { ...inactiveSemester, isActive: true };
      mockRepository.findById.mockResolvedValue(inactiveSemester);
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        isActive: true,
      });
      mockRepository.activateById.mockResolvedValue(activatedSemester);

      const result = await useCase.execute('sem-1');

      expect(mockRepository.activateById).toHaveBeenCalledWith('sem-1');
      expect(result.isActive).toBe(true);
    });
  });
});
