import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateTeachingAssignmentDto } from '../dto/request/create-teaching-assignment.dto.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';
import {
  BulkAssignmentResult,
  SKIP_ALREADY_ASSIGNED,
  SkippedClassroom,
} from '../domain/types/bulk-assignment.type.js';

@Injectable()
export class CreateTeachingAssignmentUseCase {
  constructor(
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(
    dto: CreateTeachingAssignmentDto,
  ): Promise<BulkAssignmentResult> {
    const semester = await this.teachingAssignmentRepository.findSemesterById(
      dto.semesterId,
    );
    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    // The same classroom twice in one request is a UI slip, not two assignments.
    const classroomIds = [...new Set(dto.classroomIds)];

    // Validate every classroom before writing anything: a missing classroom or
    // one from another academic year can never succeed, so failing fast beats
    // creating half the rows and reporting the rest.
    for (const classroomId of classroomIds) {
      const classroom =
        await this.teachingAssignmentRepository.findClassroomById(classroomId);

      if (!classroom) {
        throw new BadRequestException(`Classroom ${classroomId} not found`);
      }
      if (classroom.academicYearId !== semester.academicYearId) {
        throw new BadRequestException(
          'Classroom and semester must belong to the same academic year',
        );
      }
    }

    const created: BulkAssignmentResult['created'] = [];
    const skipped: SkippedClassroom[] = [];

    for (const classroomId of classroomIds) {
      const duplicate = await this.teachingAssignmentRepository.findDuplicate(
        dto.teacherId,
        classroomId,
        dto.subjectId,
        dto.semesterId,
      );
      if (duplicate) {
        skipped.push({ classroomId, reason: SKIP_ALREADY_ASSIGNED });
        continue;
      }

      const input = {
        teacherId: dto.teacherId,
        classroomId,
        subjectId: dto.subjectId,
        semesterId: dto.semesterId,
      };

      // Re-assigning a classroom that was removed earlier revives the original
      // row, keeping whatever schedules and assessment items hang off it.
      const softDeleted =
        await this.teachingAssignmentRepository.findSoftDeleted(
          dto.teacherId,
          classroomId,
          dto.subjectId,
          dto.semesterId,
        );

      created.push(
        softDeleted
          ? await this.teachingAssignmentRepository.restore(
              softDeleted.id,
              input,
            )
          : await this.teachingAssignmentRepository.create(input),
      );
    }

    // Nothing new at all is the single-classroom 409 the caller used to get.
    if (created.length === 0) {
      throw new ConflictException(
        'Teaching assignment already exists for every selected classroom',
      );
    }

    return { created, skipped };
  }
}
