import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateClassroomStructureDto } from '../dto/request/create-classroom-structure.dto.js';
import { IClassroomStructureRepository } from '../domain/interfaces/classroom-structure-repository.interface.js';

@Injectable()
export class CreateClassroomStructureUseCase {
  private readonly logger = new Logger(CreateClassroomStructureUseCase.name);

  constructor(
    private readonly classroomStructureRepository: IClassroomStructureRepository,
  ) {}

  async execute(dto: CreateClassroomStructureDto) {
    const existing = await this.classroomStructureRepository.findStructure(
      dto.classroomId,
      dto.semesterId,
    );

    if (existing)
      throw new ConflictException(
        'Classroom structure already exists for this classroom/semester',
      );

    const positionEntries = [
      { field: 'president', id: dto.presidentId },
      { field: 'vicePresident', id: dto.vicePresidentId },
      { field: 'secretary', id: dto.secretaryId },
      { field: 'treasurer', id: dto.treasurerId },
    ].filter((e): e is { field: string; id: string } => !!e.id);

    const studentIds = positionEntries.map((e) => e.id);
    const uniqueIds = new Set(studentIds);
    if (uniqueIds.size !== studentIds.length) {
      throw new BadRequestException(
        'A student cannot hold more than one position in the same structure',
      );
    }

    const structure = await this.classroomStructureRepository.create({
      classroomId: dto.classroomId,
      semesterId: dto.semesterId,
      presidentId: dto.presidentId,
      vicePresidentId: dto.vicePresidentId,
      secretaryId: dto.secretaryId,
      treasurerId: dto.treasurerId,
    });

    this.logger.log(
      `ClassroomStructure created for classroom ${dto.classroomId}, semester ${dto.semesterId}`,
    );
    return structure;
  }
}
