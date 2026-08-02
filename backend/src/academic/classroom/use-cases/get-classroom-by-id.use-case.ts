import { Injectable, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class GetClassroomByIdUseCase {
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(id: string) {
    const classRecord = await this.classroomRepository.findById(id);
    if (!classRecord)
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    return withDisplayName(classRecord);
  }
}
