import { Injectable, NotFoundException } from '@nestjs/common';
import { IReligionRepository } from '../domain/interfaces/religion-repository.interface.js';

@Injectable()
export class GetReligionByIdUseCase {
  constructor(private readonly repository: IReligionRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Religion with ID ${id} not found');
    }
    return item;
  }
}
