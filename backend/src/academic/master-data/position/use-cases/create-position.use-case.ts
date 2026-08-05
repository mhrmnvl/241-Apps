import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePositionDto } from '../dto/request/create-position.dto.js';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';

@Injectable()
export class CreatePositionUseCase {
  private readonly logger = new Logger(CreatePositionUseCase.name);

  constructor(private readonly positionRepository: IPositionRepository) {}

  async execute(dto: CreatePositionDto) {
    const existing = await this.positionRepository.findByName(dto.name);
    if (existing)
      throw new ConflictException(
        `Position name "${dto.name}" is already taken`,
      );

    const position = await this.positionRepository.create({
      name: dto.name,
      categoryId: dto.categoryId,
      isActive: dto.isActive,
    });
    this.logger.log(`Position created: ${position.name}`);
    return position;
  }
}
