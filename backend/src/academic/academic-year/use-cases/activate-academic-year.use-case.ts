import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

/**
 * Activating a year does not require it to have terms yet.
 *
 * It used to: a year with no semesters was refused, on the reasoning that an
 * empty active year is a broken one. It is not. Every reader already copes —
 * the dashboard resolves `activeAcademicYear?.semesters?.[0] ?? null` and its
 * DTO types the answer as nullable — and the state is identical to a fresh
 * install, which the system has to handle regardless.
 *
 * What it did instead was force an order with no basis behind it. Creating a
 * semester needs its year to *exist*, not to be active, so "create the year,
 * create its terms, then activate" and "create the year, activate, then create
 * its terms" reach the same place; only the second was refused, and only after
 * the operator had clicked.
 *
 * The hazard worth naming is a different one this never addressed: activating
 * a year deactivates whichever was active, so the school can be left with no
 * active *semester*. A year holding one inactive term passed the old check and
 * left exactly that state.
 */
@Injectable()
export class ActivateAcademicYearUseCase {
  private readonly logger = new Logger(ActivateAcademicYearUseCase.name);

  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string) {
    const current = await this.academicYearRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (current.isActive) {
      return current;
    }

    const activated = await this.academicYearRepository.activateById(id);
    this.logger.log(`Academic Year activated: ${id}`);
    return activated;
  }
}
