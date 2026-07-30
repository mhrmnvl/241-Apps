import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomSupervisorDto } from '../dto/request/update-classroom-supervisor.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class UpdateClassroomSupervisorUseCase {
  private readonly logger = new Logger(UpdateClassroomSupervisorUseCase.name);

  constructor(private readonly repository: ClassroomSupervisorsRepository) {}

  async execute(id: string, dto: UpdateClassroomSupervisorDto) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(
        `ClassroomSupervisor with ID ${id} not found`,
      );

    if (dto.classroomId && dto.classroomId !== existing.classroomId) {
      const classroom = await this.repository.findClassroomById(
        dto.classroomId,
      );
      if (!classroom)
        throw new NotFoundException(
          `Classroom with ID ${dto.classroomId} not found`,
        );
    }

    if (dto.teacherId && dto.teacherId !== existing.teacherId) {
      const teacher = await this.repository.findTeacherById(dto.teacherId);
      if (!teacher)
        throw new NotFoundException(
          `Teacher with ID ${dto.teacherId} not found`,
        );
    }

    if (dto.semesterId && dto.semesterId !== existing.semesterId) {
      const semester = await this.repository.findSemesterById(dto.semesterId);
      if (!semester)
        throw new NotFoundException(
          `Semester with ID ${dto.semesterId} not found`,
        );
    }

    const newClassroomId = dto.classroomId ?? existing.classroomId;
    const newSemesterId = dto.semesterId ?? existing.semesterId;

    if (dto.classroomId || dto.semesterId) {
      const [classroom, semester] = await Promise.all([
        this.repository.findClassroomById(newClassroomId),
        this.repository.findSemesterById(newSemesterId),
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
      newClassroomId !== existing.classroomId ||
      newSemesterId !== existing.semesterId
    ) {
      const dup = await this.repository.findByClassroomAndSemester(
        newClassroomId,
        newSemesterId,
      );
      if (dup && dup.id !== id)
        throw new ConflictException(
          'This classroom already has a supervisor assigned for this semester',
        );
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`ClassroomSupervisor updated: ${id}`);
    return updated;
  }
}
