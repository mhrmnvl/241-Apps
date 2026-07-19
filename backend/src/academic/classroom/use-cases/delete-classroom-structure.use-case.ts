import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';

@Injectable()
export class DeleteClassroomStructureUseCase {
  private readonly logger = new Logger(DeleteClassroomStructureUseCase.name);

  constructor(private readonly repo: ClassroomStructuresRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`ClassStructure with ID ${id} not found`);

    await this.repo.softDelete(id);
    this.logger.log(`ClassStructure deleted: ${id}`);
  }
}
