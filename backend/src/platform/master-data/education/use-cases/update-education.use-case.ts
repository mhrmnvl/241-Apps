import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEducationDto } from '../dto/update-education.dto.js';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';

@Injectable()
export class UpdateEducationUseCase {
  private readonly logger = new Logger(UpdateEducationUseCase.name);

  constructor(private readonly repository: IEducationRepository) {}

  async execute(id: string, dto: UpdateEducationDto) {
    const current = await this.repository.findById(id);
    if (!current)
      throw new NotFoundException(`Education with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.repository.findByName(dto.name, id);
      if (duplicate) {
        throw new ConflictException(
          `Education with name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Education updated: ${id}`);
    return updated;
  }
}
