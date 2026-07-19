import { Injectable, NotFoundException } from '@nestjs/common';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';

@Injectable()
export class GetClassroomLevelByIdUseCase {
  constructor(private readonly repository: IClassroomLevelsRepository) {}

  async execute(id: string) {
    const level = await this.repository.findById(id);
    if (!level) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }
    return level;
  }
}
