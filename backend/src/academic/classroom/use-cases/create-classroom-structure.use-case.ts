import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomStructureDto } from '../dto/create-classroom-structure.dto.js';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';

@Injectable()
export class CreateClassroomStructureUseCase {
  private readonly logger = new Logger(CreateClassroomStructureUseCase.name);

  constructor(private readonly repo: ClassroomStructuresRepository) {}

  async execute(dto: CreateClassroomStructureDto) {
    const [classroom, semester, existing] = await Promise.all([
      this.repo.findClassroomById(dto.classroomId),
      this.repo.findSemesterById(dto.semesterId),
      this.repo.findByClassroomAndSemester(dto.classroomId, dto.semesterId),
    ]);

    if (!classroom)
      throw new NotFoundException(
        `Classroom with ID ${dto.classroomId} not found`,
      );
    if (!semester)
      throw new NotFoundException(
        `Semester with ID ${dto.semesterId} not found`,
      );
    if (existing)
      throw new ConflictException(
        'Classroom structure already exists for this classroom/semester',
      );

    const positionEntries = [
      { field: 'Ketua Kelas', id: dto.presidentId },
      { field: 'Wakil Ketua', id: dto.vicePresidentId },
      { field: 'Sekretaris', id: dto.secretaryId },
      { field: 'Bendahara', id: dto.treasurerId },
    ].filter((e): e is { field: string; id: string } => !!e.id);

    const studentIds = positionEntries.map((e) => e.id);
    const uniqueIds = new Set(studentIds);
    if (uniqueIds.size !== studentIds.length) {
      throw new BadRequestException(
        'Satu siswa tidak boleh menjabat lebih dari satu posisi dalam struktur yang sama',
      );
    }

    for (const { field, id } of positionEntries) {
      const enrollment = await this.repo.findActiveEnrollment(
        id,
        dto.classroomId,
        dto.semesterId,
      );
      if (!enrollment)
        throw new BadRequestException(
          `Siswa ${id} tidak terdaftar aktif di kelas ini pada semester yang dipilih`,
        );

      const existingPosition = await this.repo.findByStudentAndSemester(
        id,
        dto.semesterId,
      );
      if (existingPosition) {
        throw new ConflictException(
          `Siswa yang dipilih untuk ${field} sudah menjabat di kelas ${existingPosition.classroom.code} pada semester ini`,
        );
      }
    }

    const structure = await this.repo.create({
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
