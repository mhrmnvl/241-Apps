import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateOccupationDto } from '../dto/request/create-occupation.dto.js';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class CreateOccupationUseCase {
  private readonly logger = new Logger(CreateOccupationUseCase.name);

  constructor(private readonly repository: IOccupationRepository) {}

  async execute(dto: CreateOccupationDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing)
      throw new ConflictException(
        `Occupation name "${dto.name}" is already taken`,
      );

    const occupation = await this.repository.create(dto);
    this.logger.log(`Occupation created: ${occupation.name}`);
    return occupation;
  }
}
