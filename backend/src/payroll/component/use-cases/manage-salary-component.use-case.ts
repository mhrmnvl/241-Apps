import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SalaryComponentEntity } from '../domain/entities/salary-component.entity.js';
import { ISalaryComponentRepository } from '../domain/interfaces/salary-component-repository.interface.js';
import { CreateSalaryComponentDto } from '../dto/request/create-salary-component.dto.js';
import { UpdateSalaryComponentDto } from '../dto/request/update-salary-component.dto.js';

/** Types that may carry a driver: one requires it, one permits it. */
const DRIVEN_TYPE = 'ATTENDANCE_DRIVEN';
const DRIVABLE_TYPES = [DRIVEN_TYPE, 'DEDUCTION'];

/**
 * The type decides the **sign**; the driver decides whether the amount is
 * fixed or counted.
 *
 * They are separate questions, and conflating them is how "potongan alpa"
 * ends up increasing someone's pay: a deduction driven by absent days is both
 * a `DEDUCTION` and driven. A driver on a fixed component would be a value
 * nobody reads; `ATTENDANCE_DRIVEN` without one has no count to multiply and
 * would silently produce zero. Both are refused.
 */
function assertDriverCoherent(
  type: string | undefined,
  driver: string | null | undefined,
): void {
  if (type === DRIVEN_TYPE && !driver) {
    throw new UnprocessableEntityException(
      'An attendance-driven component needs a driver.',
    );
  }
  if (type && !DRIVABLE_TYPES.includes(type) && driver) {
    throw new UnprocessableEntityException(
      'Only an attendance-driven component or a deduction may have a driver.',
    );
  }
}

@Injectable()
export class GetSalaryComponentsUseCase {
  constructor(private readonly repository: ISalaryComponentRepository) {}

  async execute(includeInactive = false): Promise<SalaryComponentEntity[]> {
    return this.repository.findAll(includeInactive);
  }
}

@Injectable()
export class CreateSalaryComponentUseCase {
  constructor(private readonly repository: ISalaryComponentRepository) {}

  async execute(dto: CreateSalaryComponentDto): Promise<SalaryComponentEntity> {
    assertDriverCoherent(dto.type, dto.driver);

    if (await this.repository.findByCode(dto.code)) {
      throw new ConflictException(`Code "${dto.code}" is already in use.`);
    }

    return this.repository.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      driver: dto.driver ?? null,
    });
  }
}

@Injectable()
export class UpdateSalaryComponentUseCase {
  constructor(private readonly repository: ISalaryComponentRepository) {}

  async execute(
    id: string,
    dto: UpdateSalaryComponentDto,
  ): Promise<SalaryComponentEntity> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Salary component not found');
    }

    assertDriverCoherent(
      dto.type ?? existing.type,
      dto.driver ?? existing.driver,
    );

    return this.repository.update(id, dto);
  }
}

@Injectable()
export class DeleteSalaryComponentUseCase {
  constructor(private readonly repository: ISalaryComponentRepository) {}

  async execute(id: string): Promise<SalaryComponentEntity> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException('Salary component not found');
    }

    // Removing a component that historical payslips reference would leave those
    // lines pointing at nothing. The lines carry a denormalised code and name
    // so they still read, but the component itself must stay findable while
    // anyone is assigned to it.
    const assigned = await this.repository.countAssignments(id);
    if (assigned > 0) {
      throw new ConflictException(
        `${assigned} employee assignment(s) still use this component. Deactivate it instead.`,
      );
    }

    return this.repository.softDelete(id);
  }
}
