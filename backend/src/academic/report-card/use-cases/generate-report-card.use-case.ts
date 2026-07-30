import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoreRepository } from '../../assessment/domain/interfaces/student-scores-repository.interface.js';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GenerateReportCardUseCase {
  private readonly logger = new Logger(GenerateReportCardUseCase.name);

  constructor(
    private readonly reportCardRepository: IReportCardRepository,
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(dto: GenerateReportCardDto) {
    const enrollment = await this.enrollmentRepository.findById(
      dto.enrollmentId,
    );
    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${dto.enrollmentId} not found`,
      );
    }

    const scoresResult = await this.studentScoreRepository.findAllForReportCard(
      dto.enrollmentId,
    );

    const scoresWithValue = scoresResult.filter(
      (s) => s.score !== null && s.score !== undefined,
    );

    let totalAverage: number | null = null;
    if (scoresWithValue.length > 0) {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const s of scoresWithValue) {
        const weight = s.assessmentItem?.weight ?? 1;
        totalWeightedScore += (s.score ?? 0) * weight;
        totalWeight += weight;
      }

      totalAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
    }

    let calculatedRank = dto.rank ?? null;

    let reportCard = await this.reportCardRepository.upsert({
      enrollmentId: dto.enrollmentId,
      totalAverage,
      rank: calculatedRank,
      teacherNote: dto.teacherNote ?? null,
      isPublished: dto.isPublished ?? false,
    });

    // Auto-rank calculation per classroom & semester when rank is not explicitly provided
    if (dto.rank === undefined && totalAverage !== null) {
      const classroomId = enrollment.classroom?.id ?? enrollment.classroomId;
      const semesterId = enrollment.semester?.id ?? enrollment.semesterId;

      if (classroomId && semesterId) {
        calculatedRank =
          await this.reportCardRepository.calculateAndApplyClassroomRanks(
            classroomId,
            semesterId,
            dto.enrollmentId,
          );

        if (calculatedRank !== null) {
          reportCard = { ...reportCard, rank: calculatedRank };
        }
      }
    }

    this.logger.log(
      `ReportCard generated for enrollment ${dto.enrollmentId} — Avg: ${totalAverage?.toFixed(2) ?? '-'}, Rank: ${calculatedRank ?? '-'}`,
    );

    return reportCard;
  }
}
