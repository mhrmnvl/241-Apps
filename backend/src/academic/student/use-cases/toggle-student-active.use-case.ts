import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { StudentRepository } from '../repositories/student.repository.js';

@Injectable()
export class ToggleStudentActiveUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(id: string, isActive: boolean): Promise<User> {
    const student = await this.repo.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }
    return this.repo.toggleUserActive(student.user.id, isActive);
  }
}
