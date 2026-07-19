import { Injectable, NotFoundException } from '@nestjs/common';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class GetPositionByIdUseCase {
  constructor(private readonly repo: IPositionRepository) {}

  async execute(id: string) {
    const position = await this.repo.findById(id);
    if (!position)
      throw new NotFoundException(`Position with ID ${id} not found`);
    return position;
  }
}
