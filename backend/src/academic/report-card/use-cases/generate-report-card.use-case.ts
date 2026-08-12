import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentType } from '@prisma/client';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import {
  IStudentScoreRepository,
  ReportCardScoreRow,
} from '../../assessment/domain/interfaces/student-score-repository.interface.js';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import {
  calculateSubjectGrades,
  calculateTotalAverage,
  type ScoredAssessment,
  type SubjectGradeInput,
} from '../services/calculate-subject-grades.js';

@Injectable()
export class GenerateReportCardUseCase {
  private readonly logger = new Logger(GenerateReportCardUseCase.name);

  constructor(
    private readonly reportCardRepository: IReportCardRepository,
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  /**
   * Regroups a student's scores into one input per subject.
   *
   * The passing score and the type weights are read off the teaching assignment that
   * owns each score, so two classes of the same subject can be graded on
   * different terms without either knowing about the other.
   */
  private groupBySubject(scores: ReportCardScoreRow[]): SubjectGradeInput[] {
    const bySubject = new Map<string, SubjectGradeInput>();

    for (const row of scores) {
      if (row.score === null || row.score === undefined) continue;

      const item = row.assessmentItem;
      const assignment = item.teachingAssignment;
      const subject = assignment.subject;

      let entry = bySubject.get(subject.id);
      if (!entry) {
        const typeWeights: Partial<Record<AssessmentType, number>> = {};
        for (const weight of assignment.assessmentWeights) {
          typeWeights[weight.type] = weight.weight;
        }

        entry = {
          subjectId: subject.id,
          subjectCode: subject.code ?? null,
          subjectName: subject.name,
          passingScore: assignment.passingScore ?? subject.passingScore,
          typeWeights,
          assessments: [],
        };
        bySubject.set(subject.id, entry);
      }

      const assessment: ScoredAssessment = {
        type: item.type,
        itemWeight: item.weight ?? 1,
        maxScore: item.maxScore ?? 100,
        score: row.score,
      };
      entry.assessments.push(assessment);
    }

    return [...bySubject.values()];
  }

  async execute(dto: GenerateReportCardDto) {
    const enrollment = await this.enrollmentRepository.findById(
      dto.enrollmentId,
    );
    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${dto.enrollmentId} not found`,
      );
    }

    // A published report card has been handed to a parent. Regenerating it
    // would silently replace a document that is already out in the world, so
    // it must be unpublished first — a deliberate act, by someone allowed to.
    const existing = await this.reportCardRepository.findByEnrollmentId(
      dto.enrollmentId,
    );
    if (existing?.isPublished) {
      throw new ConflictException(
        'Report card is already published and cannot be regenerated. Unpublish it first.',
      );
    }

    const scores = await this.studentScoreRepository.findAllForReportCard(
      dto.enrollmentId,
    );

    const rows = calculateSubjectGrades(this.groupBySubject(scores));
    const totalAverage = calculateTotalAverage(rows);

    let calculatedRank = dto.rank ?? null;

    let reportCard = await this.reportCardRepository.upsert({
      enrollmentId: dto.enrollmentId,
      totalAverage,
      rank: calculatedRank,
      teacherNote: dto.teacherNote ?? null,
      isPublished: dto.isPublished ?? false,
      subjects: rows.map((row) => ({
        subjectId: row.subjectId,
        subjectCode: row.code || null,
        subjectName: row.name,
        score: row.scoreValue,
        passingScore: row.passingScore,
        predicate: row.predicate,
        description: row.description,
        isComplete: row.isComplete,
      })),
    });

    // Auto-rank across the classroom when no rank was supplied.
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
      `ReportCard generated for enrollment ${dto.enrollmentId} — Subjects: ${rows.length}, Avg: ${totalAverage?.toFixed(2) ?? '-'}, Rank: ${calculatedRank ?? '-'}`,
    );

    return reportCard;
  }
}
