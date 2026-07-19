import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../../semester/index.js';
import { UpdateAcademicCalendarDto } from '../dto/update-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { UpdateAcademicCalendarUseCase } from './update-academic-calendar.use-case.js';

describe('UpdateAcademicCalendarUseCase', () => {
  let useCase: UpdateAcademicCalendarUseCase;

  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockSemesterRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAcademicCalendarUseCase,
        { provide: IAcademicCalendarRepository, useValue: mockRepo },
        { provide: ISemesterRepository, useValue: mockSemesterRepo },
      ],
    }).compile();

    useCase = module.get<UpdateAcademicCalendarUseCase>(
      UpdateAcademicCalendarUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'cal-uuid';
    const dto: UpdateAcademicCalendarDto = { title: 'Updated Title' };

    it('should update and return calendar entry', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.update.mockResolvedValue({ id, ...dto });

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockSemesterRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({ id, ...dto });
    });

    it('should validate semesterId when provided in update', async () => {
      const dtoWithSemester: UpdateAcademicCalendarDto = {
        semesterId: 'sem-uuid',
      };
      mockRepo.findById.mockResolvedValue({ id });
      mockSemesterRepo.findById.mockResolvedValue({ id: 'sem-uuid' });
      mockRepo.update.mockResolvedValue({ id });

      await useCase.execute(id, dtoWithSemester);

      expect(mockSemesterRepo.findById).toHaveBeenCalledWith('sem-uuid');
    });

    it('should throw NotFoundException when calendar not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when semester not found', async () => {
      const dtoWithSemester: UpdateAcademicCalendarDto = {
        semesterId: 'sem-missing',
      };
      mockRepo.findById.mockResolvedValue({ id });
      mockSemesterRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dtoWithSemester)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
