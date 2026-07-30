import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSocialMediaQueryDto } from '../dto/request/profile-social-media-query.dto.js';
import { ProfileRepository } from '../index.js';
import { GetAllProfileSocialMediasUseCase } from './get-all-profile-social-medias.use-case.js';

describe('GetAllProfileSocialMediasUseCase', () => {
  let useCase: GetAllProfileSocialMediasUseCase;

  const mockProfileRepository = {
    findAllWithSocialMedias: jest.fn(),
    countAllWithSocialMedias: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllProfileSocialMediasUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepository },
      ],
    }).compile();

    useCase = module.get<GetAllProfileSocialMediasUseCase>(
      GetAllProfileSocialMediasUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: ProfileSocialMediaQueryDto = { page: 1, limit: 10 };

    const mockProfiles = [
      {
        id: 'prof-1',
        userId: 'user-1',
        name: 'Ahmad Fauzi',
        user: { userRoles: [{ role: { code: 'STUDENT' } }] },
        socialMedias: [
          {
            id: 'sm-1',
            socialMediaId: 'plt-1',
            username: 'ahmad_fauzi',
            socialMedia: {
              name: 'Instagram',
              baseUrl: 'https://instagram.com/',
            },
          },
        ],
      },
    ];

    it('should return paginated list with correct shape', async () => {
      mockProfileRepository.findAllWithSocialMedias.mockResolvedValue(
        mockProfiles,
      );
      mockProfileRepository.countAllWithSocialMedias.mockResolvedValue(1);

      const result = await useCase.execute(query);

      expect(
        mockProfileRepository.findAllWithSocialMedias,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        search: undefined,
        roleCode: undefined,
      });
      expect(
        mockProfileRepository.countAllWithSocialMedias,
      ).toHaveBeenCalledWith({
        search: undefined,
        roleCode: undefined,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        userId: 'user-1',
        profileId: 'prof-1',
        profileName: 'Ahmad Fauzi',
        profileRole: 'STUDENT',
        id: 'sm-1',
        socialMediaId: 'plt-1',
        username: 'ahmad_fauzi',
        platformName: 'Instagram',
        platformBaseUrl: 'https://instagram.com/',
      });
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should flatten multiple social medias per profile', async () => {
      const profileWithMultipleSm = {
        ...mockProfiles[0],
        socialMedias: [
          {
            id: 'sm-1',
            socialMediaId: 'plt-1',
            username: 'ahmad_ig',
            socialMedia: {
              name: 'Instagram',
              baseUrl: 'https://instagram.com/',
            },
          },
          {
            id: 'sm-2',
            socialMediaId: 'plt-2',
            username: 'ahmad_fb',
            socialMedia: { name: 'Facebook', baseUrl: 'https://facebook.com/' },
          },
        ],
      };

      mockProfileRepository.findAllWithSocialMedias.mockResolvedValue([
        profileWithMultipleSm,
      ]);
      mockProfileRepository.countAllWithSocialMedias.mockResolvedValue(1);

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(2);
    });

    it('should return empty data when no profiles found', async () => {
      mockProfileRepository.findAllWithSocialMedias.mockResolvedValue([]);
      mockProfileRepository.countAllWithSocialMedias.mockResolvedValue(0);

      const result = await useCase.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should pass search and roleCode filters to repository', async () => {
      const filteredQuery: ProfileSocialMediaQueryDto = {
        page: 1,
        limit: 5,
        search: 'ahmad',
        roleCode: 'STUDENT',
      };

      mockProfileRepository.findAllWithSocialMedias.mockResolvedValue([]);
      mockProfileRepository.countAllWithSocialMedias.mockResolvedValue(0);

      await useCase.execute(filteredQuery);

      expect(
        mockProfileRepository.findAllWithSocialMedias,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        search: 'ahmad',
        roleCode: 'STUDENT',
      });
    });

    it('should calculate correct totalPages', async () => {
      mockProfileRepository.findAllWithSocialMedias.mockResolvedValue([]);
      mockProfileRepository.countAllWithSocialMedias.mockResolvedValue(25);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
