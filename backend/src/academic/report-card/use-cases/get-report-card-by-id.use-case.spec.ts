import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GetReportCardByIdUseCase } from './get-report-card-by-id.use-case.js';

describe('GetReportCardByIdUseCase', () => {
  let useCase: GetReportCardByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReportCardByIdUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetReportCardByIdUseCase>(GetReportCardByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return reportCard when found', async () => {
      const reportCard = { id: 'rap-1', totalAverage: 85 };
      mockRepo.findById.mockResolvedValue(reportCard);

      const result = await useCase.execute('rap-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('rap-1');
      expect(result).toEqual(reportCard);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('rap-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
