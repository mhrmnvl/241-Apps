import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileSocialMediaDto } from '../dto/request/create-profile-social-media.request.dto.js';
import { ProfileSocialMediaQueryDto } from '../dto/request/profile-social-media-query.request.dto.js';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.request.dto.js';
import { AddProfileSocialMediaUseCase } from '../use-cases/add-profile-social-media.use-case.js';
import { GetAllProfileSocialMediasUseCase } from '../use-cases/get-all-profile-social-medias.use-case.js';
import { GetProfileSocialMediasUseCase } from '../use-cases/get-profile-social-medias.use-case.js';
import { RemoveProfileSocialMediaUseCase } from '../use-cases/remove-profile-social-media.use-case.js';
import { UpdateProfileSocialMediaUseCase } from '../use-cases/update-profile-social-media.use-case.js';
import { ProfileSocialMediaController } from './profile-social-media.controller.js';

describe('ProfileSocialMediaController', () => {
  let controller: ProfileSocialMediaController;

  const mockGetAllProfileSocialMediasUseCase = { execute: jest.fn() };
  const mockGetProfileSocialMediasUseCase = { execute: jest.fn() };
  const mockAddProfileSocialMediaUseCase = { execute: jest.fn() };
  const mockUpdateProfileSocialMediaUseCase = { execute: jest.fn() };
  const mockRemoveProfileSocialMediaUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileSocialMediaController],
      providers: [
        {
          provide: GetAllProfileSocialMediasUseCase,
          useValue: mockGetAllProfileSocialMediasUseCase,
        },
        {
          provide: GetProfileSocialMediasUseCase,
          useValue: mockGetProfileSocialMediasUseCase,
        },
        {
          provide: AddProfileSocialMediaUseCase,
          useValue: mockAddProfileSocialMediaUseCase,
        },
        {
          provide: UpdateProfileSocialMediaUseCase,
          useValue: mockUpdateProfileSocialMediaUseCase,
        },
        {
          provide: RemoveProfileSocialMediaUseCase,
          useValue: mockRemoveProfileSocialMediaUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProfileSocialMediaController>(
      ProfileSocialMediaController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createDto: CreateProfileSocialMediaDto = {
    socialMediaId: 'plt-1',
    username: 'ahmad_fauzi',
  };

  describe('getAllSocialMedias', () => {
    it('should delegate to GetAllProfileSocialMediasUseCase', async () => {
      const query: ProfileSocialMediaQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockGetAllProfileSocialMediasUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getAllSocialMedias(query);

      expect(mockGetAllProfileSocialMediasUseCase.execute).toHaveBeenCalledWith(
        query,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getOwnSocialMedias', () => {
    it('should delegate to GetProfileSocialMediasUseCase', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'sm-1', socialMediaId: 'plt-1' }];
      mockGetProfileSocialMediasUseCase.execute.mockResolvedValue(expected);

      const result = await controller.getOwnSocialMedias(userId);

      expect(mockGetProfileSocialMediasUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('addOwnSocialMedia', () => {
    it('should delegate to AddProfileSocialMediaUseCase', async () => {
      const userId = 'user-1';
      const expected = { id: 'sm-new', ...createDto };
      mockAddProfileSocialMediaUseCase.execute.mockResolvedValue(expected);

      const result = await controller.addOwnSocialMedia(userId, createDto);

      expect(mockAddProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        createDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateOwnSocialMedia', () => {
    it('should delegate to UpdateProfileSocialMediaUseCase', async () => {
      const userId = 'user-1';
      const socialMediaId = 'sm-1';
      const dto: UpdateProfileSocialMediaDto = { username: 'new_handle' };
      const expected = { id: 'sm-1', username: 'new_handle' };
      mockUpdateProfileSocialMediaUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateOwnSocialMedia(
        userId,
        socialMediaId,
        dto,
      );

      expect(mockUpdateProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        socialMediaId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeOwnSocialMedia', () => {
    it('should delegate to RemoveProfileSocialMediaUseCase', async () => {
      const userId = 'user-1';
      const socialMediaId = 'sm-1';
      mockRemoveProfileSocialMediaUseCase.execute.mockResolvedValue(undefined);

      await controller.removeOwnSocialMedia(userId, socialMediaId);

      expect(mockRemoveProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        socialMediaId,
      );
    });
  });

  describe('findSocialMediasByAdmin', () => {
    it('should delegate to GetProfileSocialMediasUseCase with userId', async () => {
      const userId = 'user-2';
      const expected = [{ id: 'sm-2' }];
      mockGetProfileSocialMediasUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findSocialMediasByAdmin(userId);

      expect(mockGetProfileSocialMediasUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('addSocialMediaByAdmin', () => {
    it('should delegate to AddProfileSocialMediaUseCase', async () => {
      const userId = 'user-2';
      const expected = { id: 'sm-new', ...createDto };
      mockAddProfileSocialMediaUseCase.execute.mockResolvedValue(expected);

      const result = await controller.addSocialMediaByAdmin(userId, createDto);

      expect(mockAddProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        createDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateSocialMediaByAdmin', () => {
    it('should delegate to UpdateProfileSocialMediaUseCase', async () => {
      const userId = 'user-2';
      const socialMediaId = 'sm-2';
      const dto: UpdateProfileSocialMediaDto = { username: 'new_handle' };
      const expected = { id: 'sm-2', username: 'new_handle' };
      mockUpdateProfileSocialMediaUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateSocialMediaByAdmin(
        userId,
        socialMediaId,
        dto,
      );

      expect(mockUpdateProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        socialMediaId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeSocialMediaByAdmin', () => {
    it('should delegate to RemoveProfileSocialMediaUseCase', async () => {
      const userId = 'user-2';
      const socialMediaId = 'sm-2';
      mockRemoveProfileSocialMediaUseCase.execute.mockResolvedValue(undefined);

      await controller.removeSocialMediaByAdmin(userId, socialMediaId);

      expect(mockRemoveProfileSocialMediaUseCase.execute).toHaveBeenCalledWith(
        userId,
        socialMediaId,
      );
    });
  });
});
