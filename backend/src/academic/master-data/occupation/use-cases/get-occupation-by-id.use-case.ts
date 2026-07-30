import { Injectable, NotFoundException } from '@nestjs/common';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class GetOccupationByIdUseCase {
  constructor(private readonly repository: IOccupationRepository) {}

  async execute(id: string) {
    const occupation = await this.repository.findById(id);
    if (!occupation)
      throw new NotFoundException(`Occupation with ID ${id} not found`);
    return occupation;
  }
}
