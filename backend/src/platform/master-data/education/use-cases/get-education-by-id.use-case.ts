import { Injectable, NotFoundException } from '@nestjs/common';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';

@Injectable()
export class GetEducationByIdUseCase {
  constructor(private readonly repository: IEducationRepository) {}

  async execute(id: string) {
    const education = await this.repository.findById(id);
    if (!education)
      throw new NotFoundException(`Education with ID ${id} not found`);
    return education;
  }
}
