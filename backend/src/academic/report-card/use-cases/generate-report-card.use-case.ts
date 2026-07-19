import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoresRepository } from '../../assessment/domain/interfaces/student-scores-repository.interface.js';
import { GenerateReportCardDto } from '../dto/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GenerateReportCardUseCase {
  private readonly logger = new Logger(GenerateReportCardUseCase.name);

  constructor(
    private readonly repo: IReportCardRepository,
    private readonly studentScoreRepository: IStudentScoresRepository,
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(dto: GenerateReportCardDto) {
    const enrollment = await this.enrollmentRepo.findById(dto.enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${dto.enrollmentId} not found`,
      );
    }

    const scoresResult = await this.studentScoreRepository.findAll({
      enrollmentId: dto.enrollmentId,
      page: 1,
      limit: 100,
    });

    const scoresWithValue = scoresResult.data.filter(
      (s) => s.score !== null && s.score !== undefined,
    );

    const totalAverage =
      scoresWithValue.length > 0
        ? scoresWithValue.reduce((sum, s) => sum + (s.score ?? 0), 0) /
          scoresWithValue.length
        : null;

    const reportCard = await this.repo.upsert({
      enrollmentId: dto.enrollmentId,
      totalAverage,
      rank: dto.rank ?? null,
      teacherNote: dto.teacherNote ?? null,
      isPublished: dto.isPublished ?? false,
    });

    this.logger.log(
      `ReportCard generated for enrollment ${dto.enrollmentId} — Avg: ${totalAverage?.toFixed(2) ?? '-'}`,
    );

    return reportCard;
  }
}
