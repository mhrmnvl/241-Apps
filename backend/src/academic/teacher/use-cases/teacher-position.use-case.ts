import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../dto/request/teacher-position.request.dto.js';
import { TeacherPositionsRepository } from '../repositories/teacher-position.repository.js';
import { TeacherRepository } from '../index.js';

@Injectable()
export class TeacherPositionUseCase {
  private readonly logger = new Logger(TeacherPositionUseCase.name);

  constructor(
    private readonly repo: TeacherRepository,
    private readonly positionRepo: TeacherPositionsRepository,
  ) {}

  async findAll(teacherId: string) {
    await this.ensureTeacherExists(teacherId);
    return this.positionRepo.findAll(teacherId);
  }

  async assign(teacherId: string, dto: CreateTeacherPositionDto) {
    await this.ensureTeacherExists(teacherId);

    const position = await this.positionRepo.findPosition(dto.positionId);
    if (!position)
      throw new NotFoundException(
        `Position with ID ${dto.positionId} not found`,
      );
    if (!position.isActive) {
      throw new BadRequestException(
        `Position "${position.name}" is no longer active and cannot be assigned`,
      );
    }

    const existing = await this.positionRepo.findAssignment(
      teacherId,
      dto.positionId,
      new Date(dto.hireDate),
    );
    if (existing) {
      throw new ConflictException(
        'This position is already assigned to the teacher on that date',
      );
    }

    const link = await this.positionRepo.assign(teacherId, dto);
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
    const updated = await this.positionRepo.update(teacherId, linkId, dto);
    this.logger.log(`Position link ${linkId} updated for teacher ${teacherId}`);
    return updated;
  }

  async remove(teacherId: string, linkId: string): Promise<void> {
    await this.ensureTeacherExists(teacherId);
    await this.ensureLinkExists(teacherId, linkId);
    await this.positionRepo.remove(linkId);
    this.logger.log(
      `Position link ${linkId} removed from teacher ${teacherId}`,
    );
  }

  private async ensureTeacherExists(id: string) {
    const teacher = await this.repo.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }

  private async ensureLinkExists(teacherId: string, linkId: string) {
    const link = await this.positionRepo.findLinkById(teacherId, linkId);
    if (!link)
      throw new NotFoundException(
        `Position assignment with ID ${linkId} not found for this teacher`,
      );
    return link;
  }
}
