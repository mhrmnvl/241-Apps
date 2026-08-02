import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomSupervisorDto } from '../dto/request/create-classroom-supervisor.dto.js';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';

@Injectable()
export class CreateClassroomSupervisorUseCase {
  private readonly logger = new Logger(CreateClassroomSupervisorUseCase.name);

  constructor(
    private readonly classroomSupervisorRepository: IClassroomSupervisorRepository,
  ) {}

  async execute(dto: CreateClassroomSupervisorDto) {
    const [teacher, existing] = await Promise.all([
      this.classroomSupervisorRepository.findTeacherById(dto.teacherId),
      this.classroomSupervisorRepository.findAssignment(
        dto.classroomId,
        dto.semesterId,
      ),
    ]);

    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
    if (existing)
      throw new ConflictException(
        'This classroom already has a supervisor assigned for this semester',
      );

    const supervisor = await this.classroomSupervisorRepository.create({
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
