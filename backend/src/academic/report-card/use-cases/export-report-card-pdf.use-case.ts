import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetSchoolUnitUseCase } from '../../../platform/school-unit/index.js';
import { IStudentScoreRepository } from '../../assessment/domain/interfaces/student-score-repository.interface.js';
import { IAttendanceRepository } from '../../attendance/domain/interfaces/attendance-repository.interface.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { PdfService } from '../services/pdf.service.js';
import {
  calculateSubjectGrades,
  SubjectScoreInput,
} from '../services/calculate-subject-grades.js';
import {
  buildReportCardHtml,
  ReportCardPdfViewModel,
} from '../services/report-card-pdf.template.js';

@Injectable()
export class ExportReportCardPdfUseCase {
  constructor(
    private readonly reportCardRepository: IReportCardRepository,
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly pdfService: PdfService,
    private readonly getSchoolUnitUseCase: GetSchoolUnitUseCase,
  ) {}

  async execute(id: string): Promise<Buffer> {
    const reportCard = await this.reportCardRepository.findById(id);
    if (!reportCard) {
      throw new NotFoundException('Rapor tidak ditemukan');
    }

    if (!reportCard.isPublished) {
      throw new BadRequestException('Rapor belum dipublikasikan');
    }

    const enrollmentId =
      reportCard.enrollmentId ?? reportCard.studentEnrollmentId ?? '';

    const [scores, attendanceCounts] = await Promise.all([
      this.studentScoreRepository.findAllForReportCard(enrollmentId),
      this.attendanceRepository.getStatusCounts(enrollmentId),
    ]);

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

    const subjectScores: SubjectScoreInput[] = scores
      .filter(
        (s): s is typeof s & { score: number } =>
          s.score !== null && s.score !== undefined,
      )
      .map((s) => ({
        subjectId: s.assessmentItem.teachingAssignment.subject.id,
        subjectName: s.assessmentItem.teachingAssignment.subject.name,
        subjectCode: s.assessmentItem.teachingAssignment.subject.code ?? '',
        score: s.score,
      }));

    const subjectsData = calculateSubjectGrades(subjectScores);

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
