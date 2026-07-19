import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';

@Injectable()
export class DeleteAcademicCalendarUseCase {
  constructor(private readonly repo: IAcademicCalendarRepository) {}

  async execute(id: string) {
    const calendar = await this.repo.findById(id);
    if (!calendar) {
      throw new NotFoundException(`Academic calendar with id ${id} not found`);
    }
    await this.repo.softDelete(id);
  }
}
