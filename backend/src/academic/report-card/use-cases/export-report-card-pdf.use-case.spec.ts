import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetSchoolUnitUseCase } from '../../../platform/school-unit/index.js';
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
  const mockAttendanceRepository = { getStatusCounts: jest.fn() };
  const mockPdfService = { generatePdf: jest.fn() };
  const mockGetSchoolUnitUseCase = { execute: jest.fn() };

  const baseReportCard = {
    id: 'rap-1',
    enrollmentId: 'enr-1',
    isPublished: true,
    teacherNote: 'Anak yang rajin.',
    // The lines frozen when the card was generated. The exporter prints these
    // and never recomputes, so a published card cannot drift.
    subjects: [
      {
        subjectId: 'subj-2',
        subjectCode: 'IPA',
        subjectName: 'IPA',
        score: 90,
        kkm: 75,
        predicate: 'A',
        description: 'Sangat Baik',
        isComplete: true,
      },
    ],
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
        { provide: IAttendanceRepository, useValue: mockAttendanceRepository },
        { provide: PdfService, useValue: mockPdfService },
        { provide: GetSchoolUnitUseCase, useValue: mockGetSchoolUnitUseCase },
      ],
    }).compile();

    useCase = module.get<ExportReportCardPdfUseCase>(
      ExportReportCardPdfUseCase,
    );
    jest.clearAllMocks();

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
    expect(mockAttendanceRepository.getStatusCounts).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when the report card is not published', async () => {
    mockRepo.findById.mockResolvedValue({
      ...baseReportCard,
      isPublished: false,
    });

    await expect(useCase.execute('rap-1')).rejects.toThrow(BadRequestException);
    expect(mockAttendanceRepository.getStatusCounts).not.toHaveBeenCalled();
  });

  it('reads attendance for the enrollment and generates a PDF', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);

    const result = await useCase.execute('rap-1');

    expect(mockAttendanceRepository.getStatusCounts).toHaveBeenCalledWith(
      'enr-1',
    );
    expect(mockPdfService.generatePdf).toHaveBeenCalledWith(expect.any(String));
    expect(result).toEqual(Buffer.from('pdf'));
  });

  // The figures are the stored ones, so revising a KKM or retuning a weight
  // afterwards cannot change a card that has already gone home.
  it('prints the stored lines rather than recalculating them', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);

    await useCase.execute('rap-1');

    const html = mockPdfService.generatePdf.mock.calls[0][0] as string;
    expect(html).toContain('IPA');
    expect(html).toContain('90.00');
    expect(html).toContain('Sangat Baik');
    expect(html).not.toContain('Matematika');
  });

  it('prints an empty subject table when the card was generated with no scores', async () => {
    mockRepo.findById.mockResolvedValue({ ...baseReportCard, subjects: [] });

    await expect(useCase.execute('rap-1')).resolves.toEqual(Buffer.from('pdf'));
  });

  it('should fall back to default school info when GetSchoolUnitUseCase throws', async () => {
    mockRepo.findById.mockResolvedValue(baseReportCard);
    mockGetSchoolUnitUseCase.execute.mockRejectedValue(new Error('not set up'));

    await useCase.execute('rap-1');

    const html = mockPdfService.generatePdf.mock.calls[0][0] as string;
    expect(html).toContain('SIAKAD Sekolah');
  });
});
