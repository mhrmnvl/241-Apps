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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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

/**
 * Addresses, under the profile they belong to.
 *
 * This controller was mounted at `profiles` alongside `ProfileController` and
 * `ProfileSocialMediaController`, and all three declared `me`. Nest registers
 * controllers in the module's array order and Express answers with the first
 * match, so `GET /profiles/me` was mapped three times and only the first — the
 * profile itself — ever ran. Worse, `PATCH /profiles/me/:id` matched this
 * controller's `:addressId` before the social-media controller's
 * `:socialMediaId`, so editing your own social media link ran the address use
 * case against a social media id and answered "address not found".
 *
 * The frontend had already been written against the paths used here
 * (`addressApi.ts` calls `/profiles/me/addresses`), so those calls had been
 * 404ing rather than reaching the shadowed routes. Nesting the resource under
 * its parent is what removes the collision and repairs both at once.
 *
 * Self-service takes no permission, deliberately. Each `me` route resolves the
 * caller through `@CurrentUser` and the use case looks the address up *for that
 * user*, so it cannot answer about anybody else. Requiring `profiles.read`
 * here — as it did — meant a person could only reach their own address by
 * holding the permission that reads everyone's.
 */
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

  // `me` before `:userId`, or the literal is swallowed by the parameter.

  @Get('me/addresses')
  @ApiOperation({ summary: "List current user's addresses" })
  @ApiResponse({ status: 200, type: [AddressResponseDto] })
  async getOwnAddresses(@CurrentUser('id') userId: string) {
    return this.getProfileAddressesUseCase.execute(userId);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: "Add address to current user's profile" })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  async addOwnAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addProfileAddressUseCase.execute(userId, dto);
  }

  @Patch('me/addresses/:addressId')
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

  @Delete('me/addresses/:addressId')
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

  // Anyone's address. The user is named in the path rather than in a query
  // string, so the route reads as what it is and cannot be mistaken for the
  // self-service one above.

  @Get(':userId/addresses')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "Get any user's addresses" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200, type: [AddressResponseDto] })
  async findAddressesByAdmin(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.getProfileAddressesUseCase.execute(userId);
  }

  @Post(':userId/addresses')
  @RequirePermissions('profiles.create')
  @ApiOperation({ summary: "Add address to any user's profile" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  async addAddressByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addProfileAddressUseCase.execute(userId, dto);
  }

  @Patch(':userId/addresses/:addressId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update any user's address" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddressByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.updateProfileAddressUseCase.execute(userId, addressId, dto);
  }

  @Delete(':userId/addresses/:addressId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove any user's address" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'addressId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async removeAddressByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    await this.removeProfileAddressUseCase.execute(userId, addressId);
  }
}
