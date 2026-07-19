import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CreateUserDto } from '../dto/request/create-user.request.dto.js';
import { UpdateUserDto } from '../dto/request/update-user.request.dto.js';
import { UserQueryDto } from '../dto/request/user-query.request.dto.js';
import {
  UserListResponseDto,
  UserResponseDto,
} from '../dto/response/user.response.dto.js';

import { CreateUserUseCase } from '../use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../use-cases/get-user-by-id.use-case.js';
import { GetUsersUseCase } from '../use-cases/get-users.use-case.js';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Identifier already taken' })
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List all users (paginated, filterable)' })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: UserQueryDto) {
    return this.getUsersUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.ensureSelf(user, id);
    return this.getUserByIdUseCase.execute(id);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Identifier already taken' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.ensureSelf(user, id);
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUserUseCase.execute(id);
  }

  private ensureSelf(user: AuthenticatedUser, targetUserId: string) {
    if (!user) {
      throw new ForbiddenException('Forbidden');
    }
    if (user.id !== targetUserId) {
      throw new ForbiddenException('Forbidden');
    }
  }
}
