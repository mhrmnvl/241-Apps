import { Injectable } from '@nestjs/common';
import { StudentGraduationQueryDto } from '../dto/student-graduation-query.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class GetStudentGraduationsUseCase {
  constructor(private readonly repo: IGraduationRepository) {}
  async execute(query: StudentGraduationQueryDto) {
    return this.repo.findAll(query);
  }
}
