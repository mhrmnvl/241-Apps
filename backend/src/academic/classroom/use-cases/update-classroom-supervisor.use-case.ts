import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomSupervisorDto } from '../dto/request/update-classroom-supervisor.dto.js';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';

@Injectable()
export class UpdateClassroomSupervisorUseCase {
  private readonly logger = new Logger(UpdateClassroomSupervisorUseCase.name);

  constructor(
    private readonly classroomSupervisorRepository: IClassroomSupervisorRepository,
  ) {}

  async execute(id: string, dto: UpdateClassroomSupervisorDto) {
    const existing = await this.classroomSupervisorRepository.findById(id);
    if (!existing)
      throw new NotFoundException(
        `ClassroomSupervisor with ID ${id} not found`,
      );

    if (dto.teacherId && dto.teacherId !== existing.teacherId) {
      const teacher = await this.classroomSupervisorRepository.findTeacherById(
        dto.teacherId,
      );
      if (!teacher)
        throw new NotFoundException(
          `Teacher with ID ${dto.teacherId} not found`,
        );
    }

    const newClassroomId = dto.classroomId ?? existing.classroomId;
    const newSemesterId = dto.semesterId ?? existing.semesterId;

    if (
      newClassroomId !== existing.classroomId ||
      newSemesterId !== existing.semesterId
    ) {
      const dup = await this.classroomSupervisorRepository.findAssignment(
        newClassroomId,
        newSemesterId,
        id,
      );
      if (dup)
        throw new ConflictException(
          'This classroom already has a supervisor assigned for this semester',
        );
    }

    const updated = await this.classroomSupervisorRepository.update(id, {
      classroomId: dto.classroomId,
      teacherId: dto.teacherId,
      semesterId: dto.semesterId,
    });
    this.logger.log(`ClassroomSupervisor updated: ${id}`);
    return updated;
  }
}
