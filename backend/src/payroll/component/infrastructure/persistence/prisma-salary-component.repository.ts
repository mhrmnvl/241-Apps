import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { SalaryComponentEntity } from '../../domain/entities/salary-component.entity.js';
import {
  CreateSalaryComponentInput,
  ISalaryComponentRepository,
  UpdateSalaryComponentInput,
} from '../../domain/interfaces/salary-component-repository.interface.js';

@Injectable()
export class PrismaSalaryComponentRepository implements ISalaryComponentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<SalaryComponentEntity[]> {
    return this.prisma.salaryComponent.findMany({
      where: {
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<SalaryComponentEntity | null> {
    return this.prisma.salaryComponent.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string): Promise<SalaryComponentEntity | null> {
    return this.prisma.salaryComponent.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async create(
    input: CreateSalaryComponentInput,
  ): Promise<SalaryComponentEntity> {
    return this.prisma.salaryComponent.create({ data: input });
  }

  async update(
    id: string,
    input: UpdateSalaryComponentInput,
  ): Promise<SalaryComponentEntity> {
    return this.prisma.salaryComponent.update({ where: { id }, data: input });
  }

  async softDelete(id: string): Promise<SalaryComponentEntity> {
    return this.prisma.salaryComponent.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async countAssignments(componentId: string): Promise<number> {
    return this.prisma.salaryAssignment.count({
      where: { componentId, deletedAt: null },
    });
  }
}
