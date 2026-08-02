import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherPositionDto } from '../dto/request/create-teacher-position.dto.js';
import { UpdateTeacherPositionDto } from '../dto/request/update-teacher-position.dto.js';
import { ITeacherPositionRepository } from '../domain/interfaces/teacher-position-repository.interface.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class TeacherPositionUseCase {
  private readonly logger = new Logger(TeacherPositionUseCase.name);

  constructor(
    private readonly teacherRepository: ITeacherRepository,
    private readonly teacherPositionRepository: ITeacherPositionRepository,
  ) {}

  async findAll(teacherId: string) {
    await this.ensureTeacherExists(teacherId);
    return this.teacherPositionRepository.findByTeacherId(teacherId);
  }

  async assign(teacherId: string, dto: CreateTeacherPositionDto) {
    await this.ensureTeacherExists(teacherId);

    const position = await this.teacherPositionRepository.findPositionById(
      dto.positionId,
    );
    if (!position)
      throw new NotFoundException(
        `Position with ID ${dto.positionId} not found`,
      );
    if (!position.isActive) {
      throw new BadRequestException(
        `Position "${position.name}" is no longer active and cannot be assigned`,
      );
    }

    const existing =
      await this.teacherPositionRepository.findByTeacherAndPosition(
        teacherId,
        dto.positionId,
      );
    if (existing) {
      throw new ConflictException(
        'This position is already assigned to the teacher',
      );
    }

    const link = await this.teacherPositionRepository.create(teacherId, {
      ...dto,
      hireDate: new Date(dto.hireDate),
    });
    this.logger.log(
      `Position ${dto.positionId} assigned to teacher ${teacherId}`,
    );
    return link;
  }

  async update(
    teacherId: string,
    linkId: string,
    dto: UpdateTeacherPositionDto,
  ) {
    await this.ensureTeacherExists(teacherId);
    await this.ensureLinkExists(teacherId, linkId);
    const { hireDate, ...rest } = dto;
    const updated = await this.teacherPositionRepository.update(
      teacherId,
      linkId,
      {
        ...rest,
        ...(hireDate !== undefined && { hireDate: new Date(hireDate) }),
      },
    );
    this.logger.log(`Position link ${linkId} updated for teacher ${teacherId}`);
    return updated;
  }

  async remove(teacherId: string, linkId: string): Promise<void> {
    await this.ensureTeacherExists(teacherId);
    await this.ensureLinkExists(teacherId, linkId);
    await this.teacherPositionRepository.softDelete(teacherId, linkId);
    this.logger.log(
      `Position link ${linkId} removed from teacher ${teacherId}`,
    );
  }

  private async ensureTeacherExists(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }

  private async ensureLinkExists(teacherId: string, linkId: string) {
    const link = await this.teacherPositionRepository.findById(
      teacherId,
      linkId,
    );
    if (!link)
      throw new NotFoundException(
        `Position assignment with ID ${linkId} not found for this teacher`,
      );
    return link;
  }
}
