import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { UpdateStudentProfileUseCase } from '../use-cases/update-student-profile.use-case.js';
import { StudentProfileController } from './student-profile.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('StudentProfileController', () => {
  let controller: StudentProfileController;

  const mockUpdateStudentProfileService = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentProfileController],
      providers: [
        {
          provide: UpdateStudentProfileUseCase,
          useValue: mockUpdateStudentProfileService,
        },
      ],
    }).compile();

    controller = module.get<StudentProfileController>(StudentProfileController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should delegate to UpdateStudentProfileUseCase with id and dto', async () => {
      const id = 'stu-1';
      const dto: UpdateProfileDto = { name: 'Ahmad Updated' };
      const expected = { id: 'prof-1', name: 'Ahmad Updated' };
      mockUpdateStudentProfileService.execute.mockResolvedValue(expected);

      const result = await controller.updateProfile(id, dto, mockUser);

      expect(mockUpdateStudentProfileService.execute).toHaveBeenCalledWith(
        id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
