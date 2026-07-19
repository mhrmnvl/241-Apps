import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { CreateAcademicYearUseCase } from './create-academic-year.use-case.js';

describe('CreateAcademicYearUseCase', () => {
  let useCase: CreateAcademicYearUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findByName: jest.fn(),
    deactivateAll: jest.fn(),
    createWithSemestersAndClasses: jest.fn(),
  };

  const mockResult = {
    academicYear: { id: 'ay-1', name: '2025/2026', isActive: false },
    semesters: [
      { id: 'sem-1', type: 'ODD', isActive: false },
      { id: 'sem-2', type: 'EVEN', isActive: false },
    ],
    classroomsCreated: 3,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateAcademicYearUseCase>(CreateAcademicYearUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateAcademicYearDto = { name: '2025/2026' };

    it('should create academic year with semesters and copied classes', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.createWithSemestersAndClasses.mockResolvedValue(
        mockResult,
      );

      const result = await useCase.execute(dto);

      expect(mockRepository.findByName).toHaveBeenCalledWith('2025/2026');
      expect(mockRepository.createWithSemestersAndClasses).toHaveBeenCalledWith(
        { name: '2025/2026', isActive: false },
        true,
      );
      expect(result.academicYear.name).toBe('2025/2026');
      expect(result.semesters).toHaveLength(2);
      expect(result.classroomsCreated).toBe(3);
    });

    it('should throw ConflictException when name already exists', async () => {
      mockRepository.findByName.mockResolvedValue({
        id: 'existing-id',
        name: '2025/2026',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(
        mockRepository.createWithSemestersAndClasses,
      ).not.toHaveBeenCalled();
    });

    it('should deactivate all others when isActive is true', async () => {
      const activeDto: CreateAcademicYearDto = {
        name: '2025/2026',
        isActive: true,
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.deactivateAll.mockResolvedValue({ count: 1 });
      mockRepository.createWithSemestersAndClasses.mockResolvedValue({
        ...mockResult,
        academicYear: { ...mockResult.academicYear, isActive: true },
      });

      await useCase.execute(activeDto);

      expect(mockRepository.deactivateAll).toHaveBeenCalledWith();
      expect(mockRepository.createWithSemestersAndClasses).toHaveBeenCalledWith(
        { name: '2025/2026', isActive: true },
        true,
      );
    });

    it('should NOT deactivate others when isActive is false/undefined', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.createWithSemestersAndClasses.mockResolvedValue(
        mockResult,
      );

      await useCase.execute(dto);

      expect(mockRepository.deactivateAll).not.toHaveBeenCalled();
    });

    it('should skip class copy when copyClassesFromPreviousYear is false', async () => {
      const noCopyDto: CreateAcademicYearDto = {
        name: '2025/2026',
        copyClassesFromPreviousYear: false,
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.createWithSemestersAndClasses.mockResolvedValue({
        ...mockResult,
        classroomsCreated: 0,
      });

      const result = await useCase.execute(noCopyDto);

      expect(mockRepository.createWithSemestersAndClasses).toHaveBeenCalledWith(
        { name: '2025/2026', isActive: false },
        false,
      );
      expect(result.classroomsCreated).toBe(0);
    });

    it('should default copyClasses to true when not specified', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.createWithSemestersAndClasses.mockResolvedValue(
        mockResult,
      );

      await useCase.execute(dto);

      expect(mockRepository.createWithSemestersAndClasses).toHaveBeenCalledWith(
        expect.any(Object),
        true,
      );
    });
  });
});
