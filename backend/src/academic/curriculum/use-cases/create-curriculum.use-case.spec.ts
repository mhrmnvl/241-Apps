import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { CreateCurriculaDto } from '../dto/create-curriculum.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';
import { CreateCurriculaUseCase } from './create-curriculum.use-case.js';

describe('CreateCurriculaUseCase', () => {
  let useCase: CreateCurriculaUseCase;

  const mockRepository = {
    findByNameAndAcademicYear: jest.fn(),
    create: jest.fn(),
  };

  const mockAcademicYearsRepository = {
    findById: jest.fn(),
  };

  const mockAcademicYear = {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: '2024/2025',
  };

  const dto: CreateCurriculaDto = {
    academicYearId: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Kurikulum Merdeka',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCurriculaUseCase,
        { provide: ICurriculumRepository, useValue: mockRepository },
        {
          provide: IAcademicYearRepository,
          useValue: mockAcademicYearsRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCurriculaUseCase>(CreateCurriculaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockCurricula = {
      id: 'curr-uuid-1',
      name: 'Kurikulum Merdeka',
      academicYearId: dto.academicYearId,
    };

    it('should create a curricula successfully', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue(mockAcademicYear);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCurricula);

      const result = await useCase.execute(dto);

      expect(mockAcademicYearsRepository.findById).toHaveBeenCalledWith(
        dto.academicYearId,
      );
      expect(mockRepository.findByNameAndAcademicYear).toHaveBeenCalledWith(
        dto.name,
        dto.academicYearId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        academicYearId: dto.academicYearId,
        name: dto.name,
        isActive: undefined,
      });
      expect(result).toEqual(mockCurricula);
    });

    it('should throw NotFoundException when academic year does not exist', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findByNameAndAcademicYear).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when curricula name already exists in the academic year', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue(mockAcademicYear);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue({
        id: 'existing-id',
        name: 'Kurikulum Merdeka',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should pass isActive when provided', async () => {
      const dtoWithActive: CreateCurriculaDto = { ...dto, isActive: false };
      mockAcademicYearsRepository.findById.mockResolvedValue(mockAcademicYear);
      mockRepository.findByNameAndAcademicYear.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCurricula);

      await useCase.execute(dtoWithActive);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
