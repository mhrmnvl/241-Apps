import { Injectable, NotFoundException } from '@nestjs/common';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class ToggleTeacherActiveUseCase {
  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(id: string, isActive: boolean) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }
    return this.teacherRepository.toggleUserActive(teacher.user.id, isActive);
  }
}
