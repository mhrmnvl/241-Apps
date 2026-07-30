import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { CreateStudentScoreDto } from '../dto/request/create-student-score.dto.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';

@Injectable()
export class GetStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(query: StudentScoreQueryDto) {
    return this.studentScoreRepository.findAll(query);
  }
}

@Injectable()
export class GetStudentScoreByIdUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(id: string) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return r;
  }
}

@Injectable()
export class CreateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
    private readonly assessmentItemRepository: IAssessmentItemsRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: CreateStudentScoreDto) {
    const assessmentItem = await this.assessmentItemRepository.findById(
      dto.assessmentItemId,
    );
    if (!assessmentItem) {
      throw new BadRequestException('Assessment item not found');
    }

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

    return this.studentScoreRepository.create(dto);
  }
}

@Injectable()
export class UpdateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(id: string, dto: UpdateStudentScoreDto) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.studentScoreRepository.update(id, dto);
  }
}

@Injectable()
export class DeleteStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(id: string) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.studentScoreRepository.softDelete(id);
  }
}

@Injectable()
export class GetStudentScoreRosterUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
    private readonly assessmentItemRepository: IAssessmentItemsRepository,
  ) {}
  async execute(query: StudentScoreRosterQueryDto) {
    const assessmentItem = await this.assessmentItemRepository.findById(
      query.assessmentItemId,
    );
    if (!assessmentItem) {
      throw new NotFoundException(
        `AssessmentItem ${query.assessmentItemId} not found`,
      );
    }

    const items = await this.studentScoreRepository.getRoster(
      assessmentItem.id,
      assessmentItem.teachingAssignment.classroomId,
      assessmentItem.teachingAssignment.semesterId,
    );

    return {
      assessmentItem: {
        id: assessmentItem.id,
        name: assessmentItem.name,
        type: assessmentItem.type,
        weight: assessmentItem.weight,
        maxScore: assessmentItem.maxScore,
      },
      items,
    };
  }
}

@Injectable()
export class BulkUpsertStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
    private readonly assessmentItemRepository: IAssessmentItemsRepository,
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
