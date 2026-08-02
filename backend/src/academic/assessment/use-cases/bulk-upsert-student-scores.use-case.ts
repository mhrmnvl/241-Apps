import { BadRequestException, Injectable } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';

@Injectable()
export class BulkUpsertStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly assessmentItemRepository: IAssessmentItemRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: BulkUpsertStudentScoreDto) {
    const assessmentItem = await this.assessmentItemRepository.findById(
      dto.assessmentItemId,
    );
    if (!assessmentItem) {
      throw new BadRequestException('Assessment item not found');
    }

    const enrollmentIds = Array.from(
      new Set(dto.records.map((r) => r.enrollmentId)),
    );
    const enrollments =
      await this.enrollmentRepository.findManyActiveByIds(enrollmentIds);

    if (enrollments.length !== enrollmentIds.length) {
      throw new BadRequestException(
        'Some enrollments were not found or are not active',
      );
    }

    const targetClassroomId = assessmentItem.teachingAssignment.classroomId;
    const invalidClassroom = enrollments.some(
      (e) => e.classroomId !== targetClassroomId,
    );
    if (invalidClassroom) {
      throw new BadRequestException(
        'Some enrollments do not belong to the assessment item classroom',
      );
    }

    return this.studentScoreRepository.bulkUpsert(
      dto.assessmentItemId,
      dto.records,
    );
  }
}
