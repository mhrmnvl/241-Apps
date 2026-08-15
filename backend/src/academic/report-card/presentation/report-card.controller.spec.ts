import { Test, TestingModule } from '@nestjs/testing';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { UpdateReportCardDto } from '../dto/request/update-report-card.dto.js';
import { DeleteReportCardUseCase } from '../use-cases/delete-report-card.use-case.js';
import { BulkGenerateReportCardsUseCase } from '../use-cases/bulk-generate-report-cards.use-case.js';
import { GenerateReportCardUseCase } from '../use-cases/generate-report-card.use-case.js';
import { GetReportCardByIdUseCase } from '../use-cases/get-report-card-by-id.use-case.js';
import { GetReportCardsUseCase } from '../use-cases/get-report-cards.use-case.js';
import { GetMyReportCardsUseCase } from '../use-cases/get-my-report-cards.use-case.js';
import { PublishReportCardUseCase } from '../use-cases/publish-report-card.use-case.js';
import { UpdateReportCardUseCase } from '../use-cases/update-report-card.use-case.js';
import { ExportReportCardPdfUseCase } from '../use-cases/export-report-card-pdf.use-case.js';
import { ReportCardController } from './report-card.controller.js';
import { Response } from 'express';

jest.mock('../services/pdf.service.js', () => ({
  PdfService: class {},
}));

describe('ReportCardController', () => {
  let controller: ReportCardController;

  const mockGetReportCards = { execute: jest.fn() };
  const mockGetMyReportCards = { execute: jest.fn() };
  const mockGetReportCardById = { execute: jest.fn() };
  const mockGenerateReportCard = { execute: jest.fn() };
  const mockBulkGenerateReportCards = { execute: jest.fn() };
  const mockUpdateReportCard = { execute: jest.fn() };
  const mockPublishReportCard = { execute: jest.fn() };
  const mockDeleteReportCard = { execute: jest.fn() };
  const mockExportReportCardPdf = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportCardController],
      providers: [
        { provide: GetReportCardsUseCase, useValue: mockGetReportCards },
        { provide: GetMyReportCardsUseCase, useValue: mockGetMyReportCards },
        { provide: GetReportCardByIdUseCase, useValue: mockGetReportCardById },
        {
          provide: GenerateReportCardUseCase,
          useValue: mockGenerateReportCard,
        },
        {
          provide: BulkGenerateReportCardsUseCase,
          useValue: mockBulkGenerateReportCards,
        },
        { provide: UpdateReportCardUseCase, useValue: mockUpdateReportCard },
        { provide: PublishReportCardUseCase, useValue: mockPublishReportCard },
        { provide: DeleteReportCardUseCase, useValue: mockDeleteReportCard },
        {
          provide: ExportReportCardPdfUseCase,
          useValue: mockExportReportCardPdf,
        },
      ],
    }).compile();

    controller = module.get<ReportCardController>(ReportCardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetReportCardsUseCase', async () => {
      const query: ReportCardQueryDto = { page: 1, limit: 10 };
      mockGetReportCards.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(query);
      expect(mockGetReportCards.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetReportCardByIdUseCase', async () => {
      mockGetReportCardById.execute.mockResolvedValue({ id: 'rap-1' });
      const result = await controller.findOne('rap-1');
      expect(mockGetReportCardById.execute).toHaveBeenCalledWith('rap-1');
      expect(result).toEqual({ id: 'rap-1' });
    });
  });

  describe('generate', () => {
    it('should delegate to GenerateReportCardUseCase', async () => {
      const dto: GenerateReportCardDto = { enrollmentId: 'enr-1' };
      mockGenerateReportCard.execute.mockResolvedValue({ id: 'new' });
      await controller.generate(dto);
      expect(mockGenerateReportCard.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateReportCardUseCase', async () => {
      const dto: UpdateReportCardDto = { teacherNote: 'Good progress' };
      mockUpdateReportCard.execute.mockResolvedValue({ id: 'rap-1' });
      await controller.update('rap-1', dto);
      expect(mockUpdateReportCard.execute).toHaveBeenCalledWith('rap-1', dto);
    });
  });

  describe('publish', () => {
    it('should delegate to PublishReportCardUseCase', async () => {
      mockPublishReportCard.execute.mockResolvedValue({ id: 'rap-1' });
      await controller.publish('rap-1');
      expect(mockPublishReportCard.execute).toHaveBeenCalledWith('rap-1');
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteReportCardUseCase', async () => {
      mockDeleteReportCard.execute.mockResolvedValue(undefined);
      await controller.remove('rap-1');
      expect(mockDeleteReportCard.execute).toHaveBeenCalledWith('rap-1');
    });
  });

  describe('exportPdf', () => {
    it('should delegate to ExportReportCardPdfUseCase', async () => {
      const mockBuffer = Buffer.from('pdf data');
      mockExportReportCardPdf.execute.mockResolvedValue(mockBuffer);

      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      await controller.exportPdf('rap-1', mockRes);

      expect(mockExportReportCardPdf.execute).toHaveBeenCalledWith('rap-1');
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
        }),
      );
    });
  });
});
