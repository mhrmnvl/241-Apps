import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/interfaces/student-repository.interface.js';
import { StudentRepository } from '../repositories/student.repository.js';

@Injectable()
export class ToggleStudentActiveUseCase {
  constructor(private readonly repository: StudentRepository) {}

  async execute(id: string, isActive: boolean): Promise<User> {
    const student = await this.repository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }
    return this.repository.toggleUserActive(student.user.id, isActive);
  }
}
