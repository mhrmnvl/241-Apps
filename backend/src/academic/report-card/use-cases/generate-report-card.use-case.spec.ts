import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoresRepository } from '../../assessment/domain/interfaces/student-scores-repository.interface.js';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GenerateReportCardUseCase } from './generate-report-card.use-case.js';

describe('GenerateReportCardUseCase', () => {
  let useCase: GenerateReportCardUseCase;

  const mockRepo = {
    upsert: jest.fn(),
    calculateAndApplyClassroomRanks: jest.fn(),
  };
  const mockScoreRepo = { findAllForReportCard: jest.fn() };
  const mockEnrollmentRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReportCardUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
        { provide: IStudentScoresRepository, useValue: mockScoreRepo },
        { provide: IEnrollmentRepository, useValue: mockEnrollmentRepo },
      ],
    }).compile();

    useCase = module.get<GenerateReportCardUseCase>(GenerateReportCardUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: GenerateReportCardDto = {
      enrollmentId: 'enr-1',
    };

    it('should generate reportCard with weighted average successfully', async () => {
      mockEnrollmentRepo.findById.mockResolvedValue({ id: 'enr-1' });
      // Score 80 with weight 2, Score 100 with weight 1 => (80*2 + 100*1) / 3 = 86.666...
      mockScoreRepo.findAllForReportCard.mockResolvedValue([
        { score: 80, assessmentItem: { weight: 2 } },
        { score: 100, assessmentItem: { weight: 1 } },
      ]);
      const reportCard = { id: 'rap-1', totalAverage: 86.66666666666667 };
      mockRepo.upsert.mockResolvedValue(reportCard);

      const result = await useCase.execute(dto);

      expect(mockEnrollmentRepo.findById).toHaveBeenCalledWith('enr-1');
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAverage: 86.66666666666667,
        }),
      );
      expect(result).toEqual(reportCard);
    });

    it('should handle empty scores with null average', async () => {
      mockEnrollmentRepo.findById.mockResolvedValue({ id: 'enr-1' });
      mockScoreRepo.findAllForReportCard.mockResolvedValue([]);
      mockRepo.upsert.mockResolvedValue({ id: 'rap-1', totalAverage: null });

      const result = await useCase.execute(dto);

      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: null }),
      );
      expect(result.totalAverage).toBeNull();
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      mockEnrollmentRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
