import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { AuditLogQueryDto } from '../dto/request/audit-log-query.dto.js';
import { AuditLogResponseDto } from '../dto/response/audit-log-response.dto.js';
import { GetAuditLogsUseCase } from '../use-cases/get-audit-logs.use-case.js';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  @Get()
  @RequirePermissions('audit-logs.read')
  @ApiOperation({ summary: 'List all audit logs (paginated, filterable)' })
  @ApiResponse({ status: 200, type: [AuditLogResponseDto] })
  async findAll(@Query() query: AuditLogQueryDto) {
    return this.getAuditLogsUseCase.execute(query);
  }
}
