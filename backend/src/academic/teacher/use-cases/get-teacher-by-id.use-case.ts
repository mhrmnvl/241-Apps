import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Injectable()
export class GetTeacherByIdUseCase {
  constructor(private readonly repository: TeacherRepository) {}

  async execute(id: string) {
    const teacher = await this.repository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }
}
