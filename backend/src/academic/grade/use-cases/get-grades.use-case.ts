import { Injectable } from '@nestjs/common';
import { GradeQueryDto } from '../dto/grade-query.dto.js';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class GetGradesUseCase {
  constructor(private readonly repository: IGradeRepository) {}

  async execute(query: GradeQueryDto) {
    return this.repository.findAll(query);
  }
}
