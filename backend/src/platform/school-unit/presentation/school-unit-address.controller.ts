import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';

import {
  AddressResponseDto,
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { SchoolUnitAddressUseCase } from '../use-cases/school-unit-address.use-case.js';

@ApiTags('School Unit Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school-unit-addresses')
export class SchoolUnitAddressController {
  constructor(private readonly useCase: SchoolUnitAddressUseCase) {}

  @Get()
  @RequirePermissions('school-units.read')
  @ApiOperation({ summary: 'Get school unit primary address' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Address not set yet' })
  async getAddress() {
    return this.useCase.getAddress();
  }

  @Post()
  @RequirePermissions('school-units.create')
  @ApiOperation({ summary: 'Set school unit primary address (one-time)' })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  @ApiResponse({ status: 409, description: 'Address already exists' })
  async setAddress(@Body() dto: CreateAddressDto) {
    return this.useCase.setAddress(dto);
  }

  @Patch()
  @RequirePermissions('school-units.update')
  @ApiOperation({ summary: 'Update school unit primary address' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  async updateAddress(@Body() dto: UpdateAddressDto) {
    return this.useCase.updateAddress(dto);
  }

  @Delete()
  @RequirePermissions('school-units.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove school unit primary address' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  async removeAddress() {
    await this.useCase.removeAddress();
  }
}
