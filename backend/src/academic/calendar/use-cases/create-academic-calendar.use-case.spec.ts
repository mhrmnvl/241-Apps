import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { ISemesterRepository } from '../../semester/index.js';
import { CreateAcademicCalendarDto } from '../dto/request/create-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { CreateAcademicCalendarUseCase } from './create-academic-calendar.use-case.js';

describe('CreateAcademicCalendarUseCase', () => {
  let useCase: CreateAcademicCalendarUseCase;

  const mockRepo = {
    create: jest.fn(),
  };

  const mockAcademicYearRepo = {
    findById: jest.fn(),
  };

  const mockSemesterRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAcademicCalendarUseCase,
        { provide: IAcademicCalendarRepository, useValue: mockRepo },
        { provide: IAcademicYearRepository, useValue: mockAcademicYearRepo },
        { provide: ISemesterRepository, useValue: mockSemesterRepo },
      ],
    }).compile();

    useCase = module.get<CreateAcademicCalendarUseCase>(
      CreateAcademicCalendarUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateAcademicCalendarDto = {
      academicYearId: 'ay-uuid',
      title: 'Semester Ganjil 2024/2025',
      typeId: 'calendar-type-uuid',
      startDate: '2024-07-15',
      endDate: '2024-12-20',
    };

    it('should create calendar entry when academic year exists', async () => {
      mockAcademicYearRepo.findById.mockResolvedValue({ id: 'ay-uuid' });
      mockRepo.create.mockResolvedValue({ id: 'cal-1', ...dto });

      const result = await useCase.execute(dto);

      expect(mockAcademicYearRepo.findById).toHaveBeenCalledWith(
        dto.academicYearId,
      );
      expect(mockSemesterRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'cal-1', ...dto });
    });

    it('should validate semesterId when provided', async () => {
      const dtoWithSemester: CreateAcademicCalendarDto = {
        ...dto,
        semesterId: 'sem-uuid',
      };
      mockAcademicYearRepo.findById.mockResolvedValue({ id: 'ay-uuid' });
      mockSemesterRepo.findById.mockResolvedValue({ id: 'sem-uuid' });
      mockRepo.create.mockResolvedValue({ id: 'cal-1', ...dtoWithSemester });

      await useCase.execute(dtoWithSemester);

      expect(mockSemesterRepo.findById).toHaveBeenCalledWith('sem-uuid');
    });

    it('should throw NotFoundException when academic year not found', async () => {
      mockAcademicYearRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when semester not found', async () => {
      const dtoWithSemester: CreateAcademicCalendarDto = {
        ...dto,
        semesterId: 'sem-missing',
      };
      mockAcademicYearRepo.findById.mockResolvedValue({ id: 'ay-uuid' });
      mockSemesterRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(dtoWithSemester)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
