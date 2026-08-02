import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';

@Injectable()
export class DeleteClassroomSupervisorUseCase {
  private readonly logger = new Logger(DeleteClassroomSupervisorUseCase.name);

  constructor(
    private readonly classroomSupervisorRepository: IClassroomSupervisorRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.classroomSupervisorRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`ClassSupervisor with ID ${id} not found`);

    await this.classroomSupervisorRepository.remove(id);
    this.logger.log(`ClassSupervisor deleted: ${id}`);
  }
}
