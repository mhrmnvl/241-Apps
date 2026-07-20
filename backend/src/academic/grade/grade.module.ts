import { Module } from '@nestjs/common';
import { GradesController } from './presentation/grade.controller.js';
import { PrismaGradeRepository } from './infrastructure/persistence/prisma-grade.repository.js';
import { CreateGradeUseCase } from './use-cases/create-grade.use-case.js';
import { DeleteGradeUseCase } from './use-cases/delete-grade.use-case.js';
import { GetGradeByIdUseCase } from './use-cases/get-grade-by-id.use-case.js';
import { GetGradesUseCase } from './use-cases/get-grades.use-case.js';
import { UpdateGradeUseCase } from './use-cases/update-grade.use-case.js';
import { IGradeRepository } from './domain/interfaces/grade-repository.interface.js';

@Module({
  controllers: [GradesController],
  providers: [
    {
      provide: IGradeRepository,
      useClass: PrismaGradeRepository,
    },
    GetGradesUseCase,
    GetGradeByIdUseCase,
    CreateGradeUseCase,
    UpdateGradeUseCase,
    DeleteGradeUseCase,
  ],
  exports: [IGradeRepository],
})
export class GradeModule {}
