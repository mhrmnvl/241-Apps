import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateTeachingAssignmentDto } from '../dto/request/create-teaching-assignment.dto.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class CreateTeachingAssignmentUseCase {
  constructor(private readonly repo: ITeachingAssignmentRepository) {}

  async execute(dto: CreateTeachingAssignmentDto) {
    const [classroom, semester] = await Promise.all([
      this.repo.findClassroomById(dto.classroomId),
      this.repo.findSemesterById(dto.semesterId),
    ]);

    if (
      classroom &&
      semester &&
      classroom.academicYearId !== semester.academicYearId
    ) {
      throw new BadRequestException(
        'Classroom and semester must belong to the same academic year',
      );
    }

    if (!classroom) {
      throw new BadRequestException('Classroom not found');
    }
    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    const dup = await this.repo.findDuplicate(
      dto.teacherId,
      dto.classroomId,
      dto.subjectId,
      dto.semesterId,
    );
    if (dup) throw new ConflictException('Teaching assignment already exists');

    const softDeleted = await this.repo.findSoftDeleted(
      dto.teacherId,
      dto.classroomId,
      dto.subjectId,
      dto.semesterId,
    );
    if (softDeleted) {
      return this.repo.restore(softDeleted.id, {
        teacherId: dto.teacherId,
        classroomId: dto.classroomId,
        subjectId: dto.subjectId,
        semesterId: dto.semesterId,
      });
    }

    return this.repo.create(dto);
  }
}
