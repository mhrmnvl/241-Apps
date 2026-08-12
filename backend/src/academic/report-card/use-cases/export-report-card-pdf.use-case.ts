import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetSchoolUnitUseCase } from '../../../platform/school-unit/index.js';
import { IAttendanceRepository } from '../../attendance/domain/interfaces/attendance-repository.interface.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { PdfService } from '../services/pdf.service.js';
import { type SubjectGradeRow } from '../services/calculate-subject-grades.js';
import {
  buildReportCardHtml,
  ReportCardPdfViewModel,
} from '../services/report-card-pdf.template.js';

@Injectable()
export class ExportReportCardPdfUseCase {
  constructor(
    private readonly reportCardRepository: IReportCardRepository,
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly pdfService: PdfService,
    private readonly getSchoolUnitUseCase: GetSchoolUnitUseCase,
  ) {}

  async execute(id: string): Promise<Buffer> {
    const reportCard = await this.reportCardRepository.findById(id);
    if (!reportCard) {
      throw new NotFoundException('Report card not found');
    }

    if (!reportCard.isPublished) {
      throw new BadRequestException('Report card has not been published yet');
    }

    const enrollmentId =
      reportCard.enrollmentId ?? reportCard.studentEnrollmentId ?? '';

    const attendanceCounts =
      await this.attendanceRepository.getStatusCounts(enrollmentId);

    // Fetch School Unit info
    let schoolName = 'SIAKAD Sekolah';
    let schoolAddress = '';
    try {
      const schoolUnit = await this.getSchoolUnitUseCase.execute();
      schoolName = schoolUnit.name;
      schoolAddress = schoolUnit.email ?? schoolUnit.phone ?? '';
    } catch {
      // Use default values if school unit not set up yet
    }

    // Printed from the lines stored when the card was generated, never
    // recomputed. A published card must keep printing what it said even after
    // a KKM is revised or a weight retuned.
    const subjectsData: SubjectGradeRow[] = (reportCard.subjects ?? []).map(
      (subject, index) => ({
        no: index + 1,
        subjectId: subject.subjectId,
        code: subject.subjectCode ?? '',
        name: subject.subjectName,
        score: subject.score.toFixed(2),
        scoreValue: subject.score,
        kkm: subject.kkm,
        predicate: subject.predicate,
        description: subject.description,
        isComplete: subject.isComplete,
      }),
    );

    const studentName =
      reportCard.enrollment?.student?.user?.profile?.name ?? '-';
    const studentNis = reportCard.enrollment?.student?.nis ?? '-';
    const className = reportCard.enrollment?.classroom?.name ?? '-';
    const semesterType =
      reportCard.enrollment?.semester?.type?.name === 'ODD'
        ? '1 (Ganjil)'
        : '2 (Genap)';
    const academicYearName =
      reportCard.enrollment?.semester?.academicYear?.name ?? '-';

    const viewModel: ReportCardPdfViewModel = {
      studentName,
      studentNis,
      className,
      semesterType,
      academicYearName,
      schoolName,
      schoolAddress,
      sickCount: attendanceCounts.sick,
      excusedCount: attendanceCounts.excused,
      absentCount: attendanceCounts.absent,
      teacherNote: reportCard.teacherNote ?? reportCard.teacherNotes ?? null,
      subjectsData,
    };

    return this.pdfService.generatePdf(buildReportCardHtml(viewModel));
  }
}
