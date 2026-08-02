import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';
import { UpdateProfileDto } from '../dto/request/update-profile.dto.js';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case.js';
import { UploadProfilePhotoUseCase } from '../use-cases/upload-profile-photo.use-case.js';
import { DeleteProfilePhotoUseCase } from '../use-cases/delete-profile-photo.use-case.js';
import { ProfileController } from './profile.controller.js';

// UploadProfilePhotoUseCase imports 'file-type' (ESM-only), which Jest can't
// transform. A plain jest.mock() still evaluates the real module to build an
// automatic mock, so a factory is required to keep the real file from ever
// loading.
jest.mock('../use-cases/upload-profile-photo.use-case.js', () => ({
  UploadProfilePhotoUseCase: jest.fn(),
}));

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockGetProfileUseCase = { execute: jest.fn() };
  const mockUpdateProfileUseCase = { execute: jest.fn() };
  const mockUploadProfilePhotoUseCase = { execute: jest.fn() };
  const mockDeleteProfilePhotoUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
        { provide: UpdateProfileUseCase, useValue: mockUpdateProfileUseCase },
        {
          provide: UploadProfilePhotoUseCase,
          useValue: mockUploadProfilePhotoUseCase,
        },
        {
          provide: DeleteProfilePhotoUseCase,
          useValue: mockDeleteProfilePhotoUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOwnProfile', () => {
    it('should delegate to GetProfileUseCase with userId', async () => {
      const userId = 'user-1';
      const expected = { id: 'prof-1', name: 'Ahmad Fauzi' };
      mockGetProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getOwnProfile(userId);

      expect(mockGetProfileUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('updateOwnProfile', () => {
    it('should delegate to UpdateProfileUseCase with userId and dto', async () => {
      const userId = 'user-1';
      const dto: UpdateProfileDto = {
        name: 'Ahmad Updated',
        gender: UserGender.MALE,
      };
      const expected = { id: 'prof-1', name: 'Ahmad Updated' };
      mockUpdateProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateOwnProfile(userId, dto);

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith(
        userId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOneByAdmin', () => {
    it('should delegate to GetProfileUseCase with userId', async () => {
      const userId = 'user-2';
      const expected = { id: 'prof-2', name: 'Siti Rahayu' };
      mockGetProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findOneByAdmin(userId);

      expect(mockGetProfileUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('updateByAdmin', () => {
    it('should delegate to UpdateProfileUseCase with userId and dto', async () => {
      const userId = 'user-2';
      const dto: UpdateProfileDto = { phone: '081234567890' };
      const expected = { id: 'prof-2', phone: '081234567890' };
      mockUpdateProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateByAdmin(userId, dto);

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith(
        userId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
