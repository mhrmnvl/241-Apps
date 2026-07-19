import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { GetAcademicCalendarByIdUseCase } from './get-academic-calendar-by-id.use-case.js';

describe('GetAcademicCalendarByIdUseCase', () => {
  let useCase: GetAcademicCalendarByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAcademicCalendarByIdUseCase,
        { provide: IAcademicCalendarRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetAcademicCalendarByIdUseCase>(
      GetAcademicCalendarByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return calendar entry when found', async () => {
      const id = 'cal-uuid';
      mockRepo.findById.mockResolvedValue({ id, title: 'UTS' });

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, title: 'UTS' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
