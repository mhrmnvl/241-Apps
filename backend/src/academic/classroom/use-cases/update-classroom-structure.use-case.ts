import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomStructureDto } from '../dto/update-classroom-structure.dto.js';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';

@Injectable()
export class UpdateClassroomStructureUseCase {
  private readonly logger = new Logger(UpdateClassroomStructureUseCase.name);

  constructor(private readonly repo: ClassroomStructuresRepository) {}

  async execute(id: string, dto: UpdateClassroomStructureDto) {
    const current = await this.repo.findById(id);
    if (!current)
      throw new NotFoundException(`ClassStructure with ID ${id} not found`);

    const classroomId = dto.classroomId ?? current.classroomId;
    const semesterId = dto.semesterId ?? current.semesterId;

    const mergedPositions = {
      presidentId: dto.presidentId ?? current.presidentId,
      vicePresidentId: dto.vicePresidentId ?? current.vicePresidentId,
      secretaryId: dto.secretaryId ?? current.secretaryId,
      treasurerId: dto.treasurerId ?? current.treasurerId,
    };

    const positionLabels: Record<string, string> = {
      presidentId: 'Ketua Kelas',
      vicePresidentId: 'Wakil Ketua',
      secretaryId: 'Sekretaris',
      treasurerId: 'Bendahara',
    };

    const allIds = Object.values(mergedPositions).filter(Boolean) as string[];
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size !== allIds.length) {
      throw new BadRequestException(
        'Satu siswa tidak boleh menjabat lebih dari satu posisi dalam struktur yang sama',
      );
    }

    const changedEntries = Object.entries(dto)
      .filter(
        ([key, val]) =>
          key.endsWith('Id') &&
          key !== 'classroomId' &&
          key !== 'semesterId' &&
          val !== undefined &&
          val !== null,
      )
      .map(([key, val]) => ({
        field: positionLabels[key] ?? key,
        id: val as string,
      }));

    for (const { field, id: studentId } of changedEntries) {
      const enrollment = await this.repo.findActiveEnrollment(
        studentId,
        classroomId,
        semesterId,
      );
      if (!enrollment)
        throw new BadRequestException(
          `Siswa ${studentId} tidak terdaftar aktif di kelas ini pada semester yang dipilih`,
        );

      const existingPosition = await this.repo.findByStudentAndSemester(
        studentId,
        semesterId,
      );
      if (existingPosition && existingPosition.id !== id) {
        throw new ConflictException(
          `Siswa yang dipilih untuk ${field} sudah menjabat di kelas ${existingPosition.classroom.code} pada semester ini`,
        );
      }
    }

    const updateData: Record<string, string | null> = {};
    for (const key of [
      'presidentId',
      'vicePresidentId',
      'secretaryId',
      'treasurerId',
    ] as const) {
      if (dto[key] !== undefined) {
        updateData[key] = dto[key];
      }
    }

    const updated = await this.repo.update(id, updateData);
    this.logger.log(`ClassStructure updated: ${id}`);
    return updated;
  }
}
