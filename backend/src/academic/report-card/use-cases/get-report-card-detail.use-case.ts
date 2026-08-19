import { Injectable, NotFoundException } from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { IAttendanceRepository } from '../../attendance/domain/interfaces/attendance-repository.interface.js';

/**
 * One report card, with the attendance it is read alongside.
 *
 * The card and its frozen subject lines come from the card itself; the sick,
 * excused and absent counts are recounted from the attendance records for the
 * enrolment, exactly as `ExportReportCardPdfUseCase` does when it prints the
 * document handed to a parent. Two readings of the same rapor must not
 * disagree, so they ask the same repository the same question.
 *
 * The screen had asked for `GET /rapors/:id/detail` since the first commit and
 * no such route existed, so the dialog answered "Gagal memuat detail rapor."
 * every time it opened — on the management view and on the student's own alike.
 *
 * The enrolment comes from `findOwnership` rather than off the card, because
 * `ReportCardWithDetails` types `enrollmentId` optional: reading it here would
 * mean either a non-null assertion or a silent `undefined` reaching the
 * attendance count, and the count would come back zero rather than wrong-
 * looking.
 */
@Injectable()
export class GetReportCardDetailUseCase {
  constructor(
    private readonly reportCardRepository: IReportCardRepository,
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(id: string) {
    const ownership = await this.reportCardRepository.findOwnership(id);
    if (!ownership) {
      throw new NotFoundException(`ReportCard with ID ${id} not found`);
    }

    const [reportCard, counts] = await Promise.all([
      this.reportCardRepository.findById(id),
      this.attendanceRepository.getStatusCounts(ownership.enrollmentId),
    ]);

    if (!reportCard) {
      throw new NotFoundException(`ReportCard with ID ${id} not found`);
    }

    return {
      ...reportCard,
      attendance: {
        SICK: counts.sick,
        EXCUSED: counts.excused,
        ABSENT: counts.absent,
      },
    };
  }
}
