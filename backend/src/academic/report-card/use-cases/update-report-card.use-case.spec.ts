import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReportCardDto } from '../dto/request/update-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { UpdateReportCardUseCase } from './update-report-card.use-case.js';

describe('UpdateReportCardUseCase', () => {
  let useCase: UpdateReportCardUseCase;

  const mockRepo = { findById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReportCardUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateReportCardUseCase>(UpdateReportCardUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update reportCard successfully', async () => {
      const dto: UpdateReportCardDto = { teacherNote: 'Baik sekali', rank: 1 };
      mockRepo.findById.mockResolvedValue({ id: 'rap-1' });
      const updated = { id: 'rap-1', teacherNote: 'Baik sekali', rank: 1 };
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute('rap-1', dto);

      expect(mockRepo.findById).toHaveBeenCalledWith('rap-1');
      expect(mockRepo.update).toHaveBeenCalledWith('rap-1', {
        teacherNote: dto.teacherNote,
        rank: dto.rank,
        isPublished: undefined,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('rap-missing', {})).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
