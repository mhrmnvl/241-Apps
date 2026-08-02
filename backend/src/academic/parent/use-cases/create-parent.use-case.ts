import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateParentDto } from '../dto/request/create-parent.dto.js';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';

@Injectable()
export class CreateParentUseCase {
  private readonly logger = new Logger(CreateParentUseCase.name);

  constructor(private readonly parentRepository: IParentRepository) {}

  async execute(dto: CreateParentDto) {
    const [existingNik, occupation] = await Promise.all([
      this.parentRepository.findByNik(dto.nik),
      this.parentRepository.findOccupationById(dto.occupationId),
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

    const parent = await this.parentRepository.create({
      ...dto,
      birthDate: new Date(dto.birthDate),
    });
    this.logger.log(`Parent created: ${parent.name}`);
    return parent;
  }
}
