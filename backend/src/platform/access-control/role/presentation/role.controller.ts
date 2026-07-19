import { RequirePermissions } from '../../permissions/decorators/require-permissions.decorator.js';
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
import { CurrentUser } from '../../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../../core/types/authenticated-user.type.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';
import { AssignRoleDto } from '../dto/assign-role.dto.js';
import { RoleResponseDto } from '../dto/role-response.dto.js';
import { CreateRoleUseCase } from '../use-cases/create-role.use-case.js';
import { GetRolesUseCase } from '../use-cases/get-roles.use-case.js';
import { GetRoleByIdUseCase } from '../use-cases/get-role-by-id.use-case.js';
import { UpdateRoleUseCase } from '../use-cases/update-role.use-case.js';
import { DeleteRoleUseCase } from '../use-cases/delete-role.use-case.js';
import { AssignRoleToUserUseCase } from '../use-cases/assign-role-to-user.use-case.js';
import { RemoveRoleFromUserUseCase } from '../use-cases/remove-role-from-user.use-case.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
    private readonly rolesRepo: IRoleRepository,
  ) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const userRoles = await this.rolesRepo.findUserRoles(user.id);
    const isSuperAdmin = userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');
    return this.getRolesUseCase.execute(user.id, isSuperAdmin);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role UUID', format: 'uuid' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getRoleByIdUseCase.execute(id, user.id);
  }

  @Post()
  @RequirePermissions('roles.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'Role code already exists' })
  async create(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role UUID', format: 'uuid' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiResponse({ status: 403, description: 'System roles cannot be edited' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.updateRoleUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Role deleted' })
  @ApiResponse({ status: 403, description: 'System roles cannot be deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteRoleUseCase.execute(id);
  }

  @Post(':id/assign')
  @RequirePermissions('roles.assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', description: 'Role UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or user not found' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
  ) {
    await this.assignRoleToUserUseCase.execute(id, dto.userId, user.id);
  }

  @Delete(':id/users/:userId')
  @RequirePermissions('roles.assign')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiParam({ name: 'id', description: 'Role UUID', format: 'uuid' })
  @ApiParam({ name: 'userId', description: 'User UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  @ApiResponse({
    status: 404,
    description: 'Role, user, or assignment not found',
  })
  async unassign(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.removeRoleFromUserUseCase.execute(id, userId);
  }
}
