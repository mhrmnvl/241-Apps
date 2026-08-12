import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomStructureDto } from '../dto/request/update-classroom-structure.dto.js';
import { IClassroomStructureRepository } from '../domain/interfaces/classroom-structure-repository.interface.js';

@Injectable()
export class UpdateClassroomStructureUseCase {
  private readonly logger = new Logger(UpdateClassroomStructureUseCase.name);

  constructor(
    private readonly classroomStructureRepository: IClassroomStructureRepository,
  ) {}

  async execute(id: string, dto: UpdateClassroomStructureDto) {
    const current = await this.classroomStructureRepository.findById(id);
    if (!current)
      throw new NotFoundException(`ClassStructure with ID ${id} not found`);

    const mergedPositions = {
      presidentId: dto.presidentId ?? current.presidentId,
      vicePresidentId: dto.vicePresidentId ?? current.vicePresidentId,
      secretaryId: dto.secretaryId ?? current.secretaryId,
      treasurerId: dto.treasurerId ?? current.treasurerId,
    };

    const allIds = Object.values(mergedPositions).filter(Boolean) as string[];
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size !== allIds.length) {
      throw new BadRequestException(
        'A student cannot hold more than one position in the same structure',
      );
    }

    const updated = await this.classroomStructureRepository.update(id, {
      classroomId: dto.classroomId,
      semesterId: dto.semesterId,
      presidentId: dto.presidentId,
      vicePresidentId: dto.vicePresidentId,
      secretaryId: dto.secretaryId,
      treasurerId: dto.treasurerId,
    });
    this.logger.log(`ClassStructure updated: ${id}`);
    return updated;
  }
}
