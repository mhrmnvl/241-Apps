import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePositionDto } from '../dto/request/update-position.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class UpdatePositionUseCase {
  private readonly logger = new Logger(UpdatePositionUseCase.name);

  constructor(private readonly repository: IPositionRepository) {}

  async execute(id: string, dto: UpdatePositionDto) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(`Position with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.repository.findByName(dto.name, id);
      if (duplicate)
        throw new ConflictException(
          `Position name "${dto.name}" is already taken`,
        );
    }

    const position = await this.repository.update(id, dto);
    this.logger.log(`Position updated: ${id}`);
    return position;
  }
}
