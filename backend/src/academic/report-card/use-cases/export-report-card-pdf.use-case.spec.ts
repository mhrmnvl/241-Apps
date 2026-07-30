import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetSchoolUnitUseCase } from '../../../platform/school-unit/index.js';
import { IStudentScoreRepository } from '../../assessment/domain/interfaces/student-scores-repository.interface.js';
import { IAttendanceRepository } from '../../attendance/domain/interfaces/attendance-repository.interface.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { PdfService } from '../services/pdf.service.js';
import { ExportReportCardPdfUseCase } from './export-report-card-pdf.use-case.js';

// PdfService imports puppeteer (ESM-only), which Jest can't transform. A plain
// jest.mock() still evaluates the real module to build an automatic mock, so a
// factory is required to keep the real file (and its puppeteer import) from
// ever loading.
jest.mock('../services/pdf.service.js', () => ({
  PdfService: jest.fn(),
}));

describe('ExportReportCardPdfUseCase', () => {
  let useCase: ExportReportCardPdfUseCase;

  const mockRepo = { findById: jest.fn() };
  const mockStudentScoresRepository = { findAllForReportCard: jest.fn() };
  const mockAttendanceRepository = { getStatusCounts: jest.fn() };
  const mockPdfService = { generatePdf: jest.fn() };
  const mockGetSchoolUnitUseCase = { execute: jest.fn() };

  const baseReportCard = {
    id: 'rap-1',
    enrollmentId: 'enr-1',
    isPublished: true,
    teacherNote: 'Anak yang rajin.',
    enrollment: {
      student: { nis: '12345', user: { profile: { name: 'Budi' } } },
      classroom: { name: 'VII A' },
      semester: {
        type: { name: 'ODD' },
        academicYear: { name: '2025/2026' },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportReportCardPdfUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
        {
          provide: IStudentScoreRepository,
          useValue: mockStudentScoresRepository,
        },
        { provide: IAttendanceRepository, useValue: mockAttendanceRepository },
        { provide: PdfService, useValue: mockPdfService },
        { provide: GetSchoolUnitUseCase, useValue: mockGetSchoolUnitUseCase },
      ],
    }).compile();

    useCase = module.get<ExportReportCardPdfUseCase>(
      ExportReportCardPdfUseCase,
    );
    jest.clearAllMocks();

    mockStudentScoresRepository.findAllForReportCard.mockResolvedValue([]);
    mockAttendanceRepository.getStatusCounts.mockResolvedValue({
      sick: 0,
      excused: 0,
      absent: 0,
    });
    mockGetSchoolUnitUseCase.execute.mockResolvedValue({
      name: 'MTs Persis 241',
      email: 'info@mts241.sch.id',
      phone: null,
    });
    mockPdfService.generatePdf.mockResolvedValue(Buffer.from('pdf'));
  });

  it('should throw NotFoundException when the report card does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('rap-missing')).rejects.toThrow(
      NotFoundException,
    );
    expect(
      mockStudentScoresRepository.findAllForReportCard,
    ).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when the report card is not published', async () => {
    mockRepo.findById.mockResolvedValue({
      ...baseReportCard,
      isPublished: false,
    });

    await expect(useCase.execute('rap-1')).rejects.toThrow(BadRequestException);
    expect(
      mockStudentScoresRepository.findAllForReportCard,
    ).not.toHaveBeenCalled();
  });

  it('should fetch scores and attendance for the report card enrollment and generate a PDF', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);

    const result = await useCase.execute('rap-1');

    expect(
      mockStudentScoresRepository.findAllForReportCard,
    ).toHaveBeenCalledWith('enr-1');
    expect(mockAttendanceRepository.getStatusCounts).toHaveBeenCalledWith(
      'enr-1',
    );
    expect(mockPdfService.generatePdf).toHaveBeenCalledWith(expect.any(String));
    expect(result).toEqual(Buffer.from('pdf'));
  });

  it('should exclude scores with a null value from the subject grade calculation', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);
    mockStudentScoresRepository.findAllForReportCard.mockResolvedValue([
      {
        score: null,
        assessmentItem: {
          teachingAssignment: {
            subject: { id: 'subj-1', name: 'Matematika', code: 'MTK' },
          },
        },
      },
      {
        score: 90,
        assessmentItem: {
          teachingAssignment: {
            subject: { id: 'subj-2', name: 'IPA', code: 'IPA' },
          },
        },
      },
    ]);

    await useCase.execute('rap-1');

    const html = mockPdfService.generatePdf.mock.calls[0][0] as string;
    expect(html).toContain('IPA');
    expect(html).not.toContain('Matematika');
  });

  it('should fall back to default school info when GetSchoolUnitUseCase throws', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);
    mockGetSchoolUnitUseCase.execute.mockRejectedValue(new Error('not set up'));

    await useCase.execute('rap-1');

    const html = mockPdfService.generatePdf.mock.calls[0][0] as string;
    expect(html).toContain('SIAKAD Sekolah');
  });
});
