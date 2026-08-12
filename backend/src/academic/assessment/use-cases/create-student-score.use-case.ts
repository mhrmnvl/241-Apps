import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { CreateStudentScoreDto } from '../dto/request/create-student-score.dto.js';
import { assertScoreInRange } from '../services/assert-score-in-range.js';

@Injectable()
export class CreateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly assessmentItemRepository: IAssessmentItemRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: CreateStudentScoreDto) {
    const assessmentItem = await this.assessmentItemRepository.findById(
      dto.assessmentItemId,
    );
    if (!assessmentItem) {
      throw new BadRequestException('Assessment item not found');
    }

    assertScoreInRange(dto.score, assessmentItem.maxScore);

    const enrollment = await this.enrollmentRepository.findById(
      dto.enrollmentId,
    );
    if (enrollment?.status !== 'ACTIVE') {
      throw new BadRequestException('Enrollment not found or is not active');
    }

    if (
      enrollment.classroomId !== assessmentItem.teachingAssignment.classroomId
    ) {
      throw new BadRequestException(
        'Student enrollment classroom does not match assessment item classroom',
      );
    }

    const dup = await this.studentScoreRepository.findDuplicate(
      dto.enrollmentId,
      dto.assessmentItemId,
    );
    if (dup)
      throw new ConflictException(
        'Score already exists for this enrollment and assessment',
      );

    const softDeleted = await this.studentScoreRepository.findSoftDeleted(
      dto.enrollmentId,
      dto.assessmentItemId,
    );
    if (softDeleted) {
      return this.studentScoreRepository.restore(softDeleted.id, {
        score: dto.score,
        note: dto.note,
      });
    }

    return this.studentScoreRepository.create({
      enrollmentId: dto.enrollmentId,
      assessmentItemId: dto.assessmentItemId,
      score: dto.score,
      note: dto.note,
    });
  }
}
