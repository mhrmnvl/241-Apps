import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomSupervisorDto } from '../dto/create-classroom-supervisor.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class CreateClassroomSupervisorUseCase {
  private readonly logger = new Logger(CreateClassroomSupervisorUseCase.name);

  constructor(private readonly repo: ClassroomSupervisorsRepository) {}

  async execute(dto: CreateClassroomSupervisorDto) {
    const [classroom, teacher, semester, existing, softDeleted] =
      await Promise.all([
        this.repo.findClassroomById(dto.classroomId),
        this.repo.findTeacherById(dto.teacherId),
        this.repo.findSemesterById(dto.semesterId),
        this.repo.findByClassroomAndSemester(dto.classroomId, dto.semesterId),
        this.repo.findSoftDeletedByClassroomAndSemester(
          dto.classroomId,
          dto.semesterId,
        ),
      ]);

    if (!classroom)
      throw new NotFoundException(
        `Classroom with ID ${dto.classroomId} not found`,
      );
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
    if (!semester)
      throw new NotFoundException(
        `Semester with ID ${dto.semesterId} not found`,
      );
    if (classroom.academicYearId !== semester.academicYearId)
      throw new BadRequestException(
        'Classroom and semester must belong to the same academic year',
      );
    if (existing)
      throw new ConflictException(
        'This classroom already has a supervisor assigned for this semester',
      );

    if (softDeleted) {
      const restored = await this.repo.restore(softDeleted.id, {
        teacherId: dto.teacherId,
      });
      this.logger.log(`ClassroomSupervisor restored: ${softDeleted.id}`);
      return restored;
    }

    const supervisor = await this.repo.create({
      classroomId: dto.classroomId,
      teacherId: dto.teacherId,
      semesterId: dto.semesterId,
    });

    this.logger.log(
      `ClassroomSupervisor created: Classroom ${dto.classroomId}, Teacher ${dto.teacherId}, Semester ${dto.semesterId}`,
    );
    return supervisor;
  }
}
