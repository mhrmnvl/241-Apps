import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { CreateSemesterUseCase } from './create-semester.use-case.js';
import { CreateSemesterDto } from '../dto/create-semester.dto.js';

describe('CreateSemesterUseCase', () => {
  let useCase: CreateSemesterUseCase;

  const mockRepository = {
    findByAcademicYearAndType: jest.fn(),
    deactivateAll: jest.fn(),
    create: jest.fn(),
    findTypeById: jest.fn(),
  };

  const mockAcademicYearsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSemesterUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
        {
          provide: IAcademicYearRepository,
          useValue: mockAcademicYearsRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSemesterUseCase>(CreateSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateSemesterDto = {
      academicYearId: 'ay-1',
      typeId: 'type-odd',
    };

    it('should create a semester successfully', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
      });
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-odd',
        name: 'ODD',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: false,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });

      const result = await useCase.execute(dto);

      expect(mockAcademicYearsRepository.findById).toHaveBeenCalledWith('ay-1');
      expect(mockRepository.findTypeById).toHaveBeenCalledWith('type-odd');
      expect(mockRepository.findByAcademicYearAndType).toHaveBeenCalledWith(
        'ay-1',
        'type-odd',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        academicYearId: 'ay-1',
        typeId: 'type-odd',
        isActive: false,
      });
      expect(result.type.name).toBe('ODD');
    });

    it('should throw NotFoundException when academic year not found', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when semester type not found', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
      });
      mockRepository.findTypeById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when semester type already exists', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
      });
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-odd',
        name: 'ODD',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue({
        id: 'existing-id',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should deactivate all others when isActive is true', async () => {
      const activeDto: CreateSemesterDto = {
        ...dto,
        isActive: true,
      };

      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
      });
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-odd',
        name: 'ODD',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue(null);
      mockRepository.deactivateAll.mockResolvedValue({ count: 1 });
      mockRepository.create.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: true,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });

      await useCase.execute(activeDto);

      expect(mockRepository.deactivateAll).toHaveBeenCalledWith();
      expect(mockRepository.create).toHaveBeenCalledWith({
        academicYearId: 'ay-1',
        typeId: 'type-odd',
        isActive: true,
      });
    });

    it('should NOT deactivate others when isActive is false/undefined', async () => {
      mockAcademicYearsRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
      });
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-odd',
        name: 'ODD',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: false,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });

      await useCase.execute(dto);

      expect(mockRepository.deactivateAll).not.toHaveBeenCalled();
    });
  });
});
