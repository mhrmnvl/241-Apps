import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { UpdateCurriculaDto } from '../dto/update-curriculum.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';
import { UpdateCurriculaUseCase } from './update-curriculum.use-case.js';

describe('UpdateCurriculaUseCase', () => {
  let useCase: UpdateCurriculaUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByNameAndAcademicYear: jest.fn(),
    update: jest.fn(),
  };

  const mockAcademicYearsRepository = {
    findById: jest.fn(),
  };

  const mockExisting = {
    id: 'curr-uuid-1',
    name: 'Kurikulum Merdeka',
    academicYearId: '550e8400-e29b-41d4-a716-446655440009',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCurriculaUseCase,
        { provide: ICurriculumRepository, useValue: mockRepository },
        {
          provide: IAcademicYearRepository,
          useValue: mockAcademicYearsRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCurriculaUseCase>(UpdateCurriculaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'curr-uuid-1';

    it('should update name only without re-validating academic year', async () => {
      const dto: UpdateCurriculaDto = { name: 'Kurikulum 2013' };
      const updated = { ...mockExisting, name: 'Kurikulum 2013' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockAcademicYearsRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should validate new academicYearId when it changes', async () => {
      const newAcademicYearId = '550e8400-e29b-41d4-a716-999999999999';
      const dto: UpdateCurriculaDto = { academicYearId: newAcademicYearId };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: newAcademicYearId,
        name: '2025/2026',
      });
      mockRepository.findByNameAndAcademicYear.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({
        ...mockExisting,
        academicYearId: newAcademicYearId,
      });

      await useCase.execute(id, dto);

      expect(mockAcademicYearsRepository.findById).toHaveBeenCalledWith(
        newAcademicYearId,
      );
    });

    it('should skip academic year validation when academicYearId is unchanged', async () => {
      const dto: UpdateCurriculaDto = {
        academicYearId: mockExisting.academicYearId,
      };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(mockExisting);

      await useCase.execute(id, dto);

      expect(mockAcademicYearsRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when curricula not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when new academic year does not exist', async () => {
      const dto: UpdateCurriculaDto = {
        academicYearId: '550e8400-e29b-41d4-a716-000000000000',
      };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockAcademicYearsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name duplicates another curricula in same academic year', async () => {
      const dto: UpdateCurriculaDto = { name: 'Kurikulum 2013' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue({
        id: 'other-curr-id',
        name: 'Kurikulum 2013',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
