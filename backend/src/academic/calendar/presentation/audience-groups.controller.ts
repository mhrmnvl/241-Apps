import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

@ApiTags('Audience Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audience-groups')
export class AudienceGroupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List audience groups' })
  async findAll() {
    const data = await this.prisma.audienceGroup.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return { data };
  }
}
