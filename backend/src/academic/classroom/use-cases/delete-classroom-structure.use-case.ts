import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomStructureRepository } from '../domain/interfaces/classroom-structure-repository.interface.js';

@Injectable()
export class DeleteClassroomStructureUseCase {
  private readonly logger = new Logger(DeleteClassroomStructureUseCase.name);

  constructor(
    private readonly classroomStructureRepository: IClassroomStructureRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.classroomStructureRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`ClassStructure with ID ${id} not found`);

    await this.classroomStructureRepository.remove(id);
    this.logger.log(`ClassStructure deleted: ${id}`);
  }
}
