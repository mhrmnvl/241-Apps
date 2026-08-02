import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

jest.mock('../../../shared/utils/hash.helper.js', () => ({
  hashPassword: jest.fn(),
}));

describe('CreateTeacherUseCase', () => {
  let useCase: CreateTeacherUseCase;

  const mockRepository = {
    findUserByIdentifier: jest.fn(),
    findProfileByNik: jest.fn(),
    findByNip: jest.fn(),
    findByNuptk: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTeacherUseCase,
        { provide: ITeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateTeacherUseCase>(CreateTeacherUseCase);
    jest.clearAllMocks();
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateTeacherDto = {
      identifier: 'guru001',
      password: 'P@ssw0rd!',
      name: 'Budi Santoso',
      nik: '3578010101700001',
      gender: UserGender.MALE,
      birthPlace: 'Surabaya',
      birthDate: '1980-06-15',
      employmentTypeId: 'emp-type-uuid',
    };

    const mockTeacher = {
      id: 'emp-1',
      user: { id: 'u-1', identifier: 'guru001' },
      profile: { id: 'p-1', name: 'Budi Santoso', nik: '3578010101700001' },
    };

    it('should create an teacher successfully', async () => {
      mockRepository.findUserByIdentifier.mockResolvedValue(null);
      mockRepository.findProfileByNik.mockResolvedValue(null);
      mockRepository.findByNip.mockResolvedValue(null);
      mockRepository.findByNuptk.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTeacher);

      const result = await useCase.execute(dto);

      expect(mockRepository.findUserByIdentifier).toHaveBeenCalledWith(
        'guru001',
      );
      expect(mockRepository.findProfileByNik).toHaveBeenCalledWith(
        '3578010101700001',
      );

      expect(mockRepository.findByNip).not.toHaveBeenCalled();
      expect(mockRepository.findByNuptk).not.toHaveBeenCalled();
      // The port takes a real Date; the use case converts the ISO string.
      expect(mockRepository.create).toHaveBeenCalledWith(
        { ...dto, birthDate: new Date(dto.birthDate) },
        'hashed-password',
      );
      expect(result).toEqual(mockTeacher);
    });

    it('should throw ConflictException when identifier is already taken', async () => {
      mockRepository.findUserByIdentifier.mockResolvedValue({
        id: 'existing-u',
      });
      mockRepository.findProfileByNik.mockResolvedValue(null);
      mockRepository.findByNip.mockResolvedValue(null);
      mockRepository.findByNuptk.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when NIK is already registered', async () => {
      mockRepository.findUserByIdentifier.mockResolvedValue(null);
      mockRepository.findProfileByNik.mockResolvedValue({ id: 'existing-p' });
      mockRepository.findByNip.mockResolvedValue(null);
      mockRepository.findByNuptk.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when NIP is already registered', async () => {
      const dtoWithNip: CreateTeacherDto = {
        ...dto,
        nip: '198006152005011001',
      };

      mockRepository.findUserByIdentifier.mockResolvedValue(null);
      mockRepository.findProfileByNik.mockResolvedValue(null);
      mockRepository.findByNip.mockResolvedValue({ id: 'existing-emp' });
      mockRepository.findByNuptk.mockResolvedValue(null);

      await expect(useCase.execute(dtoWithNip)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when NUPTK is already registered', async () => {
      const dtoWithNuptk: CreateTeacherDto = {
        ...dto,
        nuptk: '1234567890123456',
      };

      mockRepository.findUserByIdentifier.mockResolvedValue(null);
      mockRepository.findProfileByNik.mockResolvedValue(null);
      mockRepository.findByNip.mockResolvedValue(null);
      mockRepository.findByNuptk.mockResolvedValue({ id: 'existing-emp' });

      await expect(useCase.execute(dtoWithNuptk)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should NOT check NIP when nip is not provided', async () => {
      mockRepository.findUserByIdentifier.mockResolvedValue(null);
      mockRepository.findProfileByNik.mockResolvedValue(null);
      mockRepository.findByNip.mockResolvedValue(null);
      mockRepository.findByNuptk.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTeacher);

      await useCase.execute(dto);

      expect(mockRepository.findByNip).not.toHaveBeenCalled();
    });
  });
});
