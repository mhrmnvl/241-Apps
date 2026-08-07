import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IHomepageSectionRepository } from '../domain/interfaces/homepage-section-repository.interface.js';
import { UpdateHomepageSectionDto } from '../dto/request/update-homepage-section.dto.js';
import { HomepageSectionSettingDto } from '../dto/response/homepage-response.dto.js';
import {
  MAX_SECTION_ITEMS,
  MIN_SECTION_ITEMS,
} from '../constants/homepage.constants.js';

@Injectable()
export class UpdateHomepageSectionUseCase {
  constructor(private readonly sectionRepository: IHomepageSectionRepository) {}

  async execute(
    key: string,
    dto: UpdateHomepageSectionDto,
  ): Promise<HomepageSectionSettingDto> {
    const existing = await this.sectionRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundException(`Seksi beranda "${key}" tidak ditemukan`);
    }

    if (
      dto.itemCount !== undefined &&
      (dto.itemCount < MIN_SECTION_ITEMS || dto.itemCount > MAX_SECTION_ITEMS)
    ) {
      throw new BadRequestException(
        `Jumlah item harus antara ${MIN_SECTION_ITEMS} dan ${MAX_SECTION_ITEMS}.`,
      );
    }

    return this.sectionRepository.update(key, {
      itemCount: dto.itemCount,
      isEnabled: dto.isEnabled,
      displayOrder: dto.displayOrder,
    });
  }
}
