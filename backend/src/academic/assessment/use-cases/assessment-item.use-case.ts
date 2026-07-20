import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';
import { AssessmentItemQueryDto } from '../dto/request/assessment-item-query.dto.js';

@Injectable()
export class GetAssessmentItemsUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(query: AssessmentItemQueryDto) {
    return this.repo.findAll(query);
  }
}

@Injectable()
export class GetAssessmentItemByIdUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`AssessmentItem ${id} not found`);
    return r;
  }
}

@Injectable()
export class CreateAssessmentItemUseCase {
  constructor(
    private readonly repo: IAssessmentItemsRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: CreateAssessmentItemDto) {
    const ta = await this.prisma.teachingAssignment.findFirst({
      where: {
        id: dto.teachingAssignmentId,
        classroom: { academicYear: { deletedAt: null } },
        deletedAt: null,
      },
    });
    if (!ta) {
      throw new BadRequestException('Teaching assignment not found');
    }
    return this.repo.create(dto);
  }
}

@Injectable()
export class UpdateAssessmentItemUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(id: string, dto: UpdateAssessmentItemDto) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`AssessmentItem ${id} not found`);
    return this.repo.update(id, dto);
  }
}

@Injectable()
export class DeleteAssessmentItemUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`AssessmentItem ${id} not found`);
    return this.repo.softDelete(id);
  }
}
