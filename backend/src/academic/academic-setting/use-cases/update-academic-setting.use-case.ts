import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateAcademicSettingDto } from '../dto/request/update-academic-setting.dto.js';
import { IAcademicSettingRepository } from '../domain/interfaces/academic-setting-repository.interface.js';

@Injectable()
export class UpdateAcademicSettingUseCase {
  private readonly logger = new Logger(UpdateAcademicSettingUseCase.name);

  constructor(private readonly repository: IAcademicSettingRepository) {}

  async execute(dto: UpdateAcademicSettingDto) {
    const existing = await this.repository.find();
    if (!existing) {
      throw new NotFoundException('Academic settings have not been set up');
    }

    // Mapped field by field rather than forwarded whole: the DTO is the HTTP
    // shape and the input is the port's, and structural typing would let any
    // future DTO field reach persistence without anyone deciding it should.
    const updated = await this.repository.update(existing.id, {
      weeklyHolidays: dto.weeklyHolidays,
    });

    this.logger.log(
      `Academic settings updated: weekly holidays [${updated.weeklyHolidays.join(', ')}]`,
    );
    return updated;
  }
}
