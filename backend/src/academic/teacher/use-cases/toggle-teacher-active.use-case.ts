import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Injectable()
export class ToggleTeacherActiveUseCase {
  constructor(private readonly repository: TeacherRepository) {}

  async execute(id: string, isActive: boolean) {
    const teacher = await this.repository.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }
    return this.repository.toggleUserActive(teacher.user.id, isActive);
  }
}
