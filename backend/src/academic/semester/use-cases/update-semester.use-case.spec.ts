import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { UpdateSemesterUseCase } from './update-semester.use-case.js';
import { UpdateSemesterDto } from '../dto/request/update-semester.dto.js';

describe('UpdateSemesterUseCase', () => {
  let useCase: UpdateSemesterUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByAcademicYearAndType: jest.fn(),
    update: jest.fn(),
    findTypeById: jest.fn(),
  };

  const mockAcademicYearsRepository = {
    findById: jest.fn(),
  };

  const existingSemester = {
    id: 'sem-1',
    academicYearId: 'ay-1',
    typeId: 'type-odd',
    type: { id: 'type-odd', name: 'ODD' },
    isActive: false,
    academicYear: { id: 'ay-1', name: '2024/2025' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSemesterUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
        {
          provide: IAcademicYearRepository,
          useValue: mockAcademicYearsRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateSemesterUseCase>(UpdateSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update semester fields successfully', async () => {
      const dto: UpdateSemesterDto = { typeId: 'type-even' };
      const updatedSemester = {
        ...existingSemester,
        typeId: 'type-even',
        type: { id: 'type-even', name: 'EVEN' },
      };
      mockRepository.findById.mockResolvedValue(existingSemester);
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-even',
        name: 'EVEN',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedSemester);

      const result = await useCase.execute('sem-1', dto);

      expect(result.type.name).toBe('EVEN');
      expect(mockRepository.update).toHaveBeenCalledWith('sem-1', dto);
    });

    it('should throw NotFoundException when semester not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent', { typeId: 'type-even' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate academic year when changing academicYearId', async () => {
      const dto: UpdateSemesterDto = { academicYearId: 'ay-new' };
      mockRepository.findById.mockResolvedValue(existingSemester);
      mockAcademicYearsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('sem-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when changing type causes duplicate', async () => {
      const dto: UpdateSemesterDto = { typeId: 'type-even' };
      mockRepository.findById.mockResolvedValue(existingSemester);
      mockRepository.findTypeById.mockResolvedValue({
        id: 'type-even',
        name: 'EVEN',
      });
      mockRepository.findByAcademicYearAndType.mockResolvedValue({
        id: 'sem-other',
      });

      await expect(useCase.execute('sem-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
