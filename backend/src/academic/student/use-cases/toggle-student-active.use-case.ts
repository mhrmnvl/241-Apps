import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/interfaces/student-repository.interface.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';

@Injectable()
export class ToggleStudentActiveUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string, isActive: boolean): Promise<User> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }
    return this.studentRepository.toggleUserActive(student.user.id, isActive);
  }
}
