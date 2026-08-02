import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { DeleteAcademicCalendarUseCase } from './delete-academic-calendar.use-case.js';

describe('DeleteAcademicCalendarUseCase', () => {
  let useCase: DeleteAcademicCalendarUseCase;

  const mockRepo = { findById: jest.fn(), remove: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAcademicCalendarUseCase,
        { provide: IAcademicCalendarRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteAcademicCalendarUseCase>(
      DeleteAcademicCalendarUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'cal-uuid';

    it('should soft-delete calendar entry', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException and not call softDelete', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
