import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class GetMetadataUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [categories, locations, conditions, statuses, fundingSources] =
      await Promise.all([
        this.prisma.inventoryCategory.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.inventoryLocation.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.inventoryCondition.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.inventoryStatus.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.inventoryFundingSource.findMany({
          orderBy: { name: 'asc' },
        }),
      ]);

    return {
      categories,
      locations,
      conditions,
      statuses,
      fundingSources,
    };
  }
}
