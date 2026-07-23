import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
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

import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../auth/index.js';

import {
  AddressResponseDto,
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { AddProfileAddressUseCase } from '../use-cases/add-profile-address.use-case.js';
import { GetProfileAddressesUseCase } from '../use-cases/get-profile-addresses.use-case.js';
import { RemoveProfileAddressUseCase } from '../use-cases/remove-profile-address.use-case.js';
import { UpdateProfileAddressUseCase } from '../use-cases/update-profile-address.use-case.js';

@ApiTags('Profile Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfileAddressController {
  constructor(
    private readonly getProfileAddressesUseCase: GetProfileAddressesUseCase,
    private readonly addProfileAddressUseCase: AddProfileAddressUseCase,
    private readonly updateProfileAddressUseCase: UpdateProfileAddressUseCase,
    private readonly removeProfileAddressUseCase: RemoveProfileAddressUseCase,
  ) {}

  @Get('me')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "List current user's addresses" })
  @ApiResponse({ status: 200, type: [AddressResponseDto] })
  async getOwnAddresses(@CurrentUser('id') userId: string) {
    return this.getProfileAddressesUseCase.execute(userId);
  }

  @Post('me')
  @RequirePermissions('profiles.create')
  @ApiOperation({ summary: "Add address to current user's profile" })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  async addOwnAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addProfileAddressUseCase.execute(userId, dto);
  }

  @Patch('me/:addressId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update current user's address" })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateOwnAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.updateProfileAddressUseCase.execute(userId, addressId, dto);
  }

  @Delete('me/:addressId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove current user's address" })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async removeOwnAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    await this.removeProfileAddressUseCase.execute(userId, addressId);
  }

  @Get()
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "Get any user's addresses (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiResponse({ status: 200, type: [AddressResponseDto] })
  async findAddressesByAdmin(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.getProfileAddressesUseCase.execute(userId);
  }

  @Post()
  @RequirePermissions('profiles.create')
  @ApiOperation({ summary: "Add address to any user's profile (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  async addAddressByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addProfileAddressUseCase.execute(userId, dto);
  }

  @Patch(':addressId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update any user's address (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddressByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.updateProfileAddressUseCase.execute(userId, addressId, dto);
  }

  @Delete(':addressId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove any user's address (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async removeAddressByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    await this.removeProfileAddressUseCase.execute(userId, addressId);
  }
}
