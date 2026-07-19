import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class GetClassroomSupervisorByIdUseCase {
  constructor(private readonly repo: ClassroomSupervisorsRepository) {}

  async execute(id: string) {
    const supervisor = await this.repo.findById(id);
    if (!supervisor)
      throw new NotFoundException(`ClassSupervisor with ID ${id} not found`);
    return supervisor;
  }
}
