import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePositionDto } from '../dto/request/update-position.dto.js';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';

@Injectable()
export class UpdatePositionUseCase {
  private readonly logger = new Logger(UpdatePositionUseCase.name);

  constructor(private readonly positionRepository: IPositionRepository) {}

  async execute(id: string, dto: UpdatePositionDto) {
    const existing = await this.positionRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`Position with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.positionRepository.findByName(dto.name, id);
      if (duplicate)
        throw new ConflictException(
          `Position name "${dto.name}" is already taken`,
        );
    }

    const position = await this.positionRepository.update(id, dto);
    this.logger.log(`Position updated: ${id}`);
    return position;
  }
}
