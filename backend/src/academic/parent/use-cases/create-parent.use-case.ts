import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateParentDto } from '../dto/create-parent.dto.js';
import { ParentRepository } from '../repositories/parent.repository.js';

@Injectable()
export class CreateParentUseCase {
  private readonly logger = new Logger(CreateParentUseCase.name);

  constructor(private readonly repo: ParentRepository) {}

  async execute(dto: CreateParentDto) {
    const [existingNik, occupation] = await Promise.all([
      this.repo.findByNik(dto.nik),
      this.repo.findOccupationById(dto.occupationId),
    ]);

    if (existingNik)
      throw new ConflictException(`NIK "${dto.nik}" is already registered`);

    if (!occupation)
      throw new NotFoundException(
        `Occupation with ID ${dto.occupationId} not found`,
      );

    if (!occupation.isActive)
      throw new ConflictException(
        `Occupation "${occupation.name}" is inactive and cannot be assigned`,
      );

    const parent = await this.repo.create(dto);
    this.logger.log(`Parent created: ${parent.name}`);
    return parent;
  }
}
