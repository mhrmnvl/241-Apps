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
      });
      expect(result).toEqual(updated);
    });

    /**
     * Publishing has its own route, its own guard — a report card with no
     * calculated average cannot be published — and its own permission,
     * `report-cards.publish` rather than `report-cards.update`. Letting the
     * flag through here skipped all three, and a published report card is what
     * a parent sees through `GET /rapors/me`.
     *
     * The DTO no longer declares the field and `forbidNonWhitelisted` rejects
     * it at the edge; this holds the line one layer further in, where a caller
     * constructing the input directly would otherwise still get through.
     */
    it('never writes isPublished, whatever it is handed', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'rap-1', isPublished: false });
      mockRepo.update.mockResolvedValue({ id: 'rap-1' });

      await useCase.execute('rap-1', {
        teacherNote: 'Baik',
        isPublished: true,
      } as UpdateReportCardDto);

      expect(mockRepo.update).toHaveBeenCalledWith('rap-1', {
        teacherNote: 'Baik',
        rank: undefined,
      });
      expect(mockRepo.update).not.toHaveBeenCalledWith(
        'rap-1',
        expect.objectContaining({ isPublished: expect.anything() }),
      );
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
