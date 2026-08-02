import { Injectable, NotFoundException } from '@nestjs/common';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';

@Injectable()
export class GetPositionByIdUseCase {
  constructor(private readonly positionRepository: IPositionRepository) {}

  async execute(id: string) {
    const position = await this.positionRepository.findById(id);
    if (!position)
      throw new NotFoundException(`Position with ID ${id} not found`);
    return position;
  }
}
