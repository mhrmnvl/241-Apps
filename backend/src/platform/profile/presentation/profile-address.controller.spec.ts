import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { AddProfileAddressUseCase } from '../use-cases/add-profile-address.use-case.js';
import { GetProfileAddressesUseCase } from '../use-cases/get-profile-addresses.use-case.js';
import { RemoveProfileAddressUseCase } from '../use-cases/remove-profile-address.use-case.js';
import { UpdateProfileAddressUseCase } from '../use-cases/update-profile-address.use-case.js';
import { ProfileAddressController } from './profile-address.controller.js';

describe('ProfileAddressController', () => {
  let controller: ProfileAddressController;

  const mockGetProfileAddressesUseCase = { execute: jest.fn() };
  const mockAddProfileAddressUseCase = { execute: jest.fn() };
  const mockUpdateProfileAddressUseCase = { execute: jest.fn() };
  const mockRemoveProfileAddressUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileAddressController],
      providers: [
        {
          provide: GetProfileAddressesUseCase,
          useValue: mockGetProfileAddressesUseCase,
        },
        {
          provide: AddProfileAddressUseCase,
          useValue: mockAddProfileAddressUseCase,
        },
        {
          provide: UpdateProfileAddressUseCase,
          useValue: mockUpdateProfileAddressUseCase,
        },
        {
          provide: RemoveProfileAddressUseCase,
          useValue: mockRemoveProfileAddressUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProfileAddressController>(ProfileAddressController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createAddressDto: CreateAddressDto = {
    street: 'Jl. Veteran No. 1',
    rt: '001',
    rw: '002',
    village: 'Penanggungan',
    district: 'Klojen',
    city: 'Kota Malang',
    province: 'Jawa Timur',
    postalCode: '65113',
  };

  describe('getOwnAddresses', () => {
    it('should delegate to GetProfileAddressesUseCase', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'addr-1' }];
      mockGetProfileAddressesUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getOwnAddresses(userId);

      expect(mockGetProfileAddressesUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('addOwnAddress', () => {
    it('should delegate to AddProfileAddressUseCase', async () => {
      const userId = 'user-1';
      const expected = { id: 'addr-new', ...createAddressDto };
      mockAddProfileAddressUseCase.execute.mockResolvedValue(expected);

      const result = await controller.addOwnAddress(userId, createAddressDto);

      expect(mockAddProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        createAddressDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateOwnAddress', () => {
    it('should delegate to UpdateProfileAddressUseCase', async () => {
      const userId = 'user-1';
      const addressId = 'addr-1';
      const dto: UpdateAddressDto = { street: 'Jl. Baru No. 2' };
      const expected = { id: 'addr-1', street: 'Jl. Baru No. 2' };
      mockUpdateProfileAddressUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateOwnAddress(userId, addressId, dto);

      expect(mockUpdateProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        addressId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeOwnAddress', () => {
    it('should delegate to RemoveProfileAddressUseCase', async () => {
      const userId = 'user-1';
      const addressId = 'addr-1';
      mockRemoveProfileAddressUseCase.execute.mockResolvedValue(undefined);

      await controller.removeOwnAddress(userId, addressId);

      expect(mockRemoveProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        addressId,
      );
    });
  });

  describe('findAddressesByAdmin', () => {
    it('should delegate to GetProfileAddressesUseCase with userId', async () => {
      const userId = 'user-2';
      const expected = [{ id: 'addr-2' }];
      mockGetProfileAddressesUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findAddressesByAdmin(userId);

      expect(mockGetProfileAddressesUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('addAddressByAdmin', () => {
    it('should delegate to AddProfileAddressUseCase', async () => {
      const userId = 'user-2';
      const expected = { id: 'addr-new', ...createAddressDto };
      mockAddProfileAddressUseCase.execute.mockResolvedValue(expected);

      const result = await controller.addAddressByAdmin(
        userId,
        createAddressDto,
      );

      expect(mockAddProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        createAddressDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateAddressByAdmin', () => {
    it('should delegate to UpdateProfileAddressUseCase', async () => {
      const userId = 'user-2';
      const addressId = 'addr-2';
      const dto: UpdateAddressDto = { city: 'Surabaya' };
      const expected = { id: 'addr-2', city: 'Surabaya' };
      mockUpdateProfileAddressUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateAddressByAdmin(
        userId,
        addressId,
        dto,
      );

      expect(mockUpdateProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        addressId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeAddressByAdmin', () => {
    it('should delegate to RemoveProfileAddressUseCase', async () => {
      const userId = 'user-2';
      const addressId = 'addr-2';
      mockRemoveProfileAddressUseCase.execute.mockResolvedValue(undefined);

      await controller.removeAddressByAdmin(userId, addressId);

      expect(mockRemoveProfileAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        addressId,
      );
    });
  });
});
