import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { ApproveActionDto } from '../dto/request/approve-action.dto.js';
import { GetPendingApprovalsUseCase } from '../use-cases/get-pending-approvals.use-case.js';
import { ProcessApprovalUseCase } from '../use-cases/process-approval.use-case.js';

@ApiTags('Inventory Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/approvals')
export class ApprovalController {
  constructor(
    private readonly getPendingApprovalsUseCase: GetPendingApprovalsUseCase,
    private readonly processApprovalUseCase: ProcessApprovalUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({
    summary: 'Get pending approvals assigned to the current user roles',
  })
  async findPending(@CurrentUser() user: AuthenticatedUser) {
    return this.getPendingApprovalsUseCase.execute(user.id);
  }

  @Post(':id/action')
  @RequirePermissions('inventory.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a pending workflow step' })
  async process(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.processApprovalUseCase.execute(id, dto, user.id);
  }
}
