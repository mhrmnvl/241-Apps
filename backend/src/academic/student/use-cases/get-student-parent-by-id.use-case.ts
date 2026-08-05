import { Injectable } from '@nestjs/common';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentLinkNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class GetStudentParentByIdUseCase {
  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(id: string): Promise<StudentParentWithDetails> {
    const link = await this.studentParentRepository.findById(id);
    if (!link) throw new StudentParentLinkNotFoundException(id);
    return link;
  }
}
