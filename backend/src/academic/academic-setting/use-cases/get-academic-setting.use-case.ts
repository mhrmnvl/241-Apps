import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicSettingRepository } from '../domain/interfaces/academic-setting-repository.interface.js';

@Injectable()
export class GetAcademicSettingUseCase {
  constructor(private readonly repository: IAcademicSettingRepository) {}

  async execute() {
    const setting = await this.repository.find();
    if (!setting) {
      // The migration creates the row, so this only happens on a database that
      // skipped it. Saying so beats returning invented defaults that would
      // quietly disagree with whatever the school actually set.
      throw new NotFoundException('Academic settings have not been set up');
    }
    return setting;
  }
}
