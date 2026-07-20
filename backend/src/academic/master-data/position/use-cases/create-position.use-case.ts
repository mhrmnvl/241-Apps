import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePositionDto } from '../dto/request/create-position.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class CreatePositionUseCase {
  private readonly logger = new Logger(CreatePositionUseCase.name);

  constructor(private readonly repo: IPositionRepository) {}

  async execute(dto: CreatePositionDto) {
    const existing = await this.repo.findByName(dto.name);
    if (existing)
      throw new ConflictException(
        `Position name "${dto.name}" is already taken`,
      );

    const position = await this.repo.create(dto);
    this.logger.log(`Position created: ${position.name}`);
    return position;
  }
}
