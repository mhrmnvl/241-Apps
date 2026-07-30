import { Injectable, NotFoundException } from '@nestjs/common';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class GetSubjectByIdUseCase {
  constructor(private readonly repository: ISubjectRepository) {}

  async execute(id: string) {
    const subject = await this.repository.findById(id);
    if (!subject)
      throw new NotFoundException(`Subject with ID ${id} not found`);
    return subject;
  }
}
