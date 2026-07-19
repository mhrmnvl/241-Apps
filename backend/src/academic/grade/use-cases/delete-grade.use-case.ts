import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';

@Injectable()
export class DeleteClassroomLevelUseCase {
  private readonly logger = new Logger(DeleteClassroomLevelUseCase.name);

  constructor(private readonly repository: IClassroomLevelsRepository) {}

  async execute(id: string) {
    const level = await this.repository.findById(id);
    if (!level) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }

    await this.repository.softDelete(id);
    this.logger.log(`Classroom level deleted: ${id}`);
  }
}
