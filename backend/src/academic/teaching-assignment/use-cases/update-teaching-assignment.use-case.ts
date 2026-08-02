import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTeachingAssignmentDto } from '../dto/request/update-teaching-assignment.dto.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class UpdateTeachingAssignmentUseCase {
  constructor(
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(id: string, dto: UpdateTeachingAssignmentDto) {
    const current = await this.teachingAssignmentRepository.findById(id);
    if (!current)
      throw new NotFoundException(`Teaching assignment ${id} not found`);

    const eId = dto.teacherId ?? current.teacherId;
    const cId = dto.classroomId ?? current.classroomId;
    const sId = dto.subjectId ?? current.subjectId;
    const smId = dto.semesterId ?? current.semesterId;

    if (dto.classroomId || dto.semesterId) {
      const [classroom, semester] = await Promise.all([
        this.teachingAssignmentRepository.findClassroomById(cId),
        this.teachingAssignmentRepository.findSemesterById(smId),
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
    }

    if (
      eId !== current.teacherId ||
      cId !== current.classroomId ||
      sId !== current.subjectId ||
      smId !== current.semesterId
    ) {
      const dup = await this.teachingAssignmentRepository.findDuplicate(
        eId,
        cId,
        sId,
        smId,
        id,
      );
      if (dup)
        throw new ConflictException('Teaching assignment already exists');
    }

    return this.teachingAssignmentRepository.update(id, dto);
  }
}
