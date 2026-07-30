import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClassroomSupervisorRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class DeleteClassroomSupervisorUseCase {
  private readonly logger = new Logger(DeleteClassroomSupervisorUseCase.name);

  constructor(private readonly repository: ClassroomSupervisorRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(`ClassSupervisor with ID ${id} not found`);

    await this.repository.softDelete(id);
    this.logger.log(`ClassSupervisor deleted: ${id}`);
  }
}
