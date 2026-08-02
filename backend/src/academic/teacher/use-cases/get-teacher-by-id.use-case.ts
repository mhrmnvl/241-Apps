import { Injectable, NotFoundException } from '@nestjs/common';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class GetTeacherByIdUseCase {
  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }
}
