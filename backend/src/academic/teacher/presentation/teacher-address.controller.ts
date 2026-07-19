import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import {
  AddressResponseDto,
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { TeacherAddressUseCase } from '../use-cases/teacher-address.use-case.js';

@ApiTags('Teacher Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeacherAddressController {
  constructor(private readonly addressUseCase: TeacherAddressUseCase) {}

  @Get()
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: "Get teacher's addresses" })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiResponse({ status: 200, type: [AddressResponseDto] })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    return this.addressUseCase.findAll(teacherId);
  }

  @Post()
  @RequirePermissions('teachers.create')
  @ApiOperation({ summary: 'Add an address to an teacher' })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async add(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressUseCase.add(teacherId, dto);
  }

  @Patch(':id')
  @RequirePermissions('teachers.update')
  @ApiOperation({ summary: 'Update an teacher address' })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Address ID', format: 'uuid' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async update(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressUseCase.update(teacherId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('teachers.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an teacher address' })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Address ID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async remove(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.addressUseCase.remove(teacherId, id);
  }
}
