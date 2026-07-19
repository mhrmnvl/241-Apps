import { Injectable } from '@nestjs/common';
import { ClassroomLevelQueryDto } from '../dto/grade-query.dto.js';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';

@Injectable()
export class GetClassroomLevelsUseCase {
  constructor(private readonly repository: IClassroomLevelsRepository) {}

  async execute(query: ClassroomLevelQueryDto) {
    return this.repository.findAll(query);
  }
}
