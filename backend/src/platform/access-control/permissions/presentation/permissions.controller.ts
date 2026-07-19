import { RequirePermissions } from '../decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/index.js';
import { AssignPermissionDto } from '../dto/assign-permission.dto.js';
import { AssignPermissionToRoleUseCase } from '../use-cases/assign-permission-to-role.use-case.js';
import { RemovePermissionFromRoleUseCase } from '../use-cases/remove-permission-from-role.use-case.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
  ) {}

  @Post('roles/:roleId')
  @RequirePermissions('permissions.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiParam({ name: 'roleId', description: 'Role UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 409, description: 'Role already has this permission' })
  async assignPermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() dto: AssignPermissionDto,
  ) {
    await this.assignPermissionToRoleUseCase.execute(roleId, dto.permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @RequirePermissions('permissions.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiParam({ name: 'roleId', description: 'Role UUID', format: 'uuid' })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission UUID',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Permission removed successfully' })
  @ApiResponse({
    status: 404,
    description: 'Role, permission, or assignment not found',
  })
  async removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    await this.removePermissionFromRoleUseCase.execute(roleId, permissionId);
  }
}
