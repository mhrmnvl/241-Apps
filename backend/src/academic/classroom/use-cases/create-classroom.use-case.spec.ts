import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateClassroomDto } from '../dto/create-classroom.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { CreateClassroomUseCase } from './create-classroom.use-case.js';

describe('CreateClassroomUseCase', () => {
  let useCase: CreateClassroomUseCase;

  const mockRepository = {
    findDuplicate: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassroomUseCase,
        { provide: ClassroomRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateClassroomUseCase>(CreateClassroomUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateClassroomDto = {
      academicYearId: 'ay-1',
      gradeId: 'lvl-7',
      code: 'VII-A',
      name: 'Awesome',
      capacity: 30,
    };

    it('should create a classroom successfully', async () => {
      const created = { id: 'cls-1', ...dto };
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepository.findDuplicate).toHaveBeenCalledWith(
        dto.academicYearId,
        dto.gradeId,
        dto.code,
      );
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ ...created, displayName: dto.name });
    });

    it('should create a classroom successfully without name', async () => {
      const dtoWithoutName = { ...dto };
      delete dtoWithoutName.name;
      const created = { id: 'cls-1', ...dtoWithoutName, name: null };
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await useCase.execute(dtoWithoutName);

      expect(mockRepository.create).toHaveBeenCalledWith({
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
        code: dto.code,
        name: null,
        capacity: dto.capacity,
        isActive: dto.isActive,
      });
      expect(result.displayName).toEqual('');
    });

    it('should throw ConflictException when duplicate exists', async () => {
      mockRepository.findDuplicate.mockResolvedValue({ id: 'existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
