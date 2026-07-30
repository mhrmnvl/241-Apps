import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassroomSupervisorRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class GetClassroomSupervisorByIdUseCase {
  constructor(private readonly repository: ClassroomSupervisorRepository) {}

  async execute(id: string) {
    const supervisor = await this.repository.findById(id);
    if (!supervisor)
      throw new NotFoundException(`ClassSupervisor with ID ${id} not found`);
    return supervisor;
  }
}
