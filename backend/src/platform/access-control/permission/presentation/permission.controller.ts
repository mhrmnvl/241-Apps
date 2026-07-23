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
  Patch,
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
import { AssignPermissionDto } from '../dto/request/assign-permission.dto.js';
import { CreatePermissionDto } from '../dto/request/create-permission.dto.js';
import { UpdatePermissionDto } from '../dto/request/update-permission.dto.js';
import { PermissionResponseDto } from '../dto/response/permission-response.dto.js';
import { AssignPermissionToRoleUseCase } from '../use-cases/assign-permission-to-role.use-case.js';
import { RemovePermissionFromRoleUseCase } from '../use-cases/remove-permission-from-role.use-case.js';
import { GetPermissionsUseCase } from '../use-cases/get-permissions.use-case.js';
import { SyncPermissionsUseCase } from '../use-cases/sync-permissions.use-case.js';
import { CreatePermissionUseCase } from '../use-cases/create-permission.use-case.js';
import { UpdatePermissionUseCase } from '../use-cases/update-permission.use-case.js';
import { DeletePermissionUseCase } from '../use-cases/delete-permission.use-case.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly syncPermissionsUseCase: SyncPermissionsUseCase,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
  ) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List the full permission catalog' })
  @ApiResponse({ status: 200, type: [PermissionResponseDto] })
  async findAll() {
    return this.getPermissionsUseCase.execute();
  }

  @Post()
  @RequirePermissions('permissions.manage')
  @ApiOperation({
    summary: 'Create a permission (code is derived as module.action)',
  })
  @ApiResponse({ status: 201, type: PermissionResponseDto })
  @ApiResponse({ status: 409, description: 'Permission code already exists' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }

  @Post('sync')
  @RequirePermissions('permissions.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Sync the code-defined permission catalog (SYSTEM_PERMISSIONS) into the database',
  })
  @ApiResponse({ status: 200, description: 'Permission catalog synced' })
  async sync() {
    await this.syncPermissionsUseCase.execute();
    return { message: 'Permission catalog synced successfully' };
  }

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

  // NOTE: the `:id` routes are declared last so the literal `roles/...` routes
  // above are matched first.

  @Patch(':id')
  @RequirePermissions('permissions.manage')
  @ApiOperation({ summary: 'Update a permission description' })
  @ApiParam({ name: 'id', description: 'Permission UUID', format: 'uuid' })
  @ApiResponse({ status: 200, type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.updatePermissionUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('permissions.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Permission deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePermissionUseCase.execute(id);
  }
}
