import { Module } from '@nestjs/common';
import { ClassroomLevelsController } from './presentation/grade.controller.js';
import { PrismaClassroomLevelsRepository } from './infrastructure/persistence/prisma-classroom-levels.repository.js';
import { CreateClassroomLevelUseCase } from './use-cases/create-grade.use-case.js';
import { DeleteClassroomLevelUseCase } from './use-cases/delete-grade.use-case.js';
import { GetClassroomLevelByIdUseCase } from './use-cases/get-grade-by-id.use-case.js';
import { GetClassroomLevelsUseCase } from './use-cases/get-grades.use-case.js';
import { UpdateClassroomLevelUseCase } from './use-cases/update-grade.use-case.js';
import { IClassroomLevelsRepository } from './domain/interfaces/classroom-levels-repository.interface.js';

@Module({
  controllers: [ClassroomLevelsController],
  providers: [
    {
      provide: IClassroomLevelsRepository,
      useClass: PrismaClassroomLevelsRepository,
    },
    GetClassroomLevelsUseCase,
    GetClassroomLevelByIdUseCase,
    CreateClassroomLevelUseCase,
    UpdateClassroomLevelUseCase,
    DeleteClassroomLevelUseCase,
  ],
  exports: [IClassroomLevelsRepository],
})
export class GradeModule {}
