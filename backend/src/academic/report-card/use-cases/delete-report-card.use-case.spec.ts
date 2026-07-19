import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { DeleteReportCardUseCase } from './delete-report-card.use-case.js';

describe('DeleteReportCardUseCase', () => {
  let useCase: DeleteReportCardUseCase;

  const mockRepo = { findById: jest.fn(), softDelete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReportCardUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteReportCardUseCase>(DeleteReportCardUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft-delete successfully', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'rap-1' });
      mockRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute('rap-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('rap-1');
      expect(mockRepo.softDelete).toHaveBeenCalledWith('rap-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('rap-missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
