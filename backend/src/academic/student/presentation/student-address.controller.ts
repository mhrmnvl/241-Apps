import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddressEntity as Address } from '../../../shared/domain/entities/address.entity.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { StudentResponseDto } from '../index.js';
import type { RequestUser } from '../types/student.types.js';
import { AddStudentAddressUseCase } from '../use-cases/add-student-address.use-case.js';
import { GetStudentAddressesUseCase } from '../use-cases/get-student-addresses.use-case.js';
import { RemoveStudentAddressUseCase } from '../use-cases/remove-student-address.use-case.js';
import { UpdateStudentAddressUseCase } from '../use-cases/update-student-address.use-case.js';

@ApiTags('Student Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentAddressController {
  constructor(
    private readonly getStudentAddressesService: GetStudentAddressesUseCase,
    private readonly addStudentAddressService: AddStudentAddressUseCase,
    private readonly updateStudentAddressService: UpdateStudentAddressUseCase,
    private readonly removeStudentAddressService: RemoveStudentAddressUseCase,
  ) {}

  @Get()
  @RequirePermissions('students.read')
  @ApiOperation({ summary: "Get student's addresses" })
  @ApiQuery({ name: 'studentId', required: true, format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findAll(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Address[]> {
    const reqUser: RequestUser = { id: user.id };
    return this.getStudentAddressesService.execute(studentId, reqUser);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Add an address to a student' })
  @ApiQuery({ name: 'studentId', required: true, format: 'uuid' })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async addAddress(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Address> {
    return this.addStudentAddressService.execute(studentId, dto);
  }

  @Patch(':addressId')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Update a student address' })
  @ApiQuery({ name: 'studentId', required: true, format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student or address not found' })
  async updateAddress(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Address> {
    return this.updateStudentAddressService.execute(studentId, addressId, dto);
  }

  @Delete(':addressId')
  @RequirePermissions('students.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a student address' })
  @ApiQuery({ name: 'studentId', required: true, format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @ApiResponse({ status: 404, description: 'Student or address not found' })
  async removeAddress(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.removeStudentAddressService.execute(studentId, addressId);
  }
}
