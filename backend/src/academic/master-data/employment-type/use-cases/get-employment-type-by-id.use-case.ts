import { Injectable, NotFoundException } from '@nestjs/common';
import { IEmploymentTypeRepository } from '../interfaces/employment-type-repository.interface.js';

@Injectable()
export class GetEmploymentTypeByIdUseCase {
  constructor(private readonly repo: IEmploymentTypeRepository) {}

  async execute(id: string) {
    const type = await this.repo.findById(id);
    if (!type) {
      throw new NotFoundException(`Employment type with ID ${id} not found`);
    }
    return type;
  }
}
