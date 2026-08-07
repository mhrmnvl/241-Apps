import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  HomepageSectionEntity,
  IHomepageSectionRepository,
  UpdateHomepageSectionInput,
} from '../../domain/interfaces/homepage-section-repository.interface.js';

const SECTION_SELECT = {
  id: true,
  key: true,
  itemCount: true,
  isEnabled: true,
  displayOrder: true,
} as const;

@Injectable()
export class PrismaHomepageSectionRepository extends IHomepageSectionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllEnabled(): Promise<HomepageSectionEntity[]> {
    return this.prisma.portalHomepageSection.findMany({
      where: { isEnabled: true },
      select: SECTION_SELECT,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAll(): Promise<HomepageSectionEntity[]> {
    return this.prisma.portalHomepageSection.findMany({
      select: SECTION_SELECT,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findByKey(key: string): Promise<HomepageSectionEntity | null> {
    return this.prisma.portalHomepageSection.findUnique({
      where: { key },
      select: SECTION_SELECT,
    });
  }

  async update(
    key: string,
    data: UpdateHomepageSectionInput,
  ): Promise<HomepageSectionEntity> {
    return this.prisma.portalHomepageSection.update({
      where: { key },
      data,
      select: SECTION_SELECT,
    });
  }
}
