import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { PublishReportCardUseCase } from './publish-report-card.use-case.js';

describe('PublishReportCardUseCase', () => {
  let useCase: PublishReportCardUseCase;

  const mockRepo = { findById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishReportCardUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<PublishReportCardUseCase>(PublishReportCardUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should toggle publish from false to true', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'rap-1', isPublished: false });
      mockRepo.update.mockResolvedValue({ id: 'rap-1', isPublished: true });

      const result = await useCase.execute('rap-1');

      expect(mockRepo.update).toHaveBeenCalledWith('rap-1', {
        isPublished: true,
      });
      expect(result.isPublished).toBe(true);
    });

    it('should toggle publish from true to false', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'rap-1', isPublished: true });
      mockRepo.update.mockResolvedValue({ id: 'rap-1', isPublished: false });

      const result = await useCase.execute('rap-1');

      expect(mockRepo.update).toHaveBeenCalledWith('rap-1', {
        isPublished: false,
      });
      expect(result.isPublished).toBe(false);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('rap-missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
