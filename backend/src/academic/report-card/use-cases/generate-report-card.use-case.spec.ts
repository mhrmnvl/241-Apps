import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoresRepository } from '../../assessment/domain/interfaces/student-scores-repository.interface.js';
import { GenerateReportCardDto } from '../dto/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GenerateReportCardUseCase } from './generate-report-card.use-case.js';

describe('GenerateReportCardUseCase', () => {
  let useCase: GenerateReportCardUseCase;

  const mockRepo = { upsert: jest.fn() };
  const mockScoreRepo = { findAll: jest.fn() };
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

    it('should generate reportCard successfully', async () => {
      mockEnrollmentRepo.findById.mockResolvedValue({ id: 'enr-1' });
      mockScoreRepo.findAll.mockResolvedValue({
        data: [{ score: 80 }, { score: 90 }],
      });
      const reportCard = { id: 'rap-1', totalAverage: 85 };
      mockRepo.upsert.mockResolvedValue(reportCard);

      const result = await useCase.execute(dto);

      expect(mockEnrollmentRepo.findById).toHaveBeenCalledWith('enr-1');
      expect(mockRepo.upsert).toHaveBeenCalled();
      expect(result).toEqual(reportCard);
    });

    it('should handle empty scores with null average', async () => {
      mockEnrollmentRepo.findById.mockResolvedValue({ id: 'enr-1' });
      mockScoreRepo.findAll.mockResolvedValue({ data: [] });
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
