import { Module } from '@nestjs/common';
import { SemesterTypeController } from './presentation/semester-type.controller.js';
import { PrismaSemesterTypeRepository } from './infrastructure/persistence/prisma-semester-type.repository.js';
import { ISemesterTypeRepository } from './domain/interfaces/semester-type-repository.interface.js';
import { CreateSemesterTypeUseCase } from './use-cases/create-semester-type.use-case.js';
import { DeleteSemesterTypeUseCase } from './use-cases/delete-semester-type.use-case.js';
import { GetSemesterTypeByIdUseCase } from './use-cases/get-semester-type-by-id.use-case.js';
import { GetSemesterTypesUseCase } from './use-cases/get-semester-types.use-case.js';
import { UpdateSemesterTypeUseCase } from './use-cases/update-semester-type.use-case.js';

@Module({
  controllers: [SemesterTypeController],
  providers: [
    {
      provide: ISemesterTypeRepository,
      useClass: PrismaSemesterTypeRepository,
    },
    GetSemesterTypesUseCase,
    GetSemesterTypeByIdUseCase,
    CreateSemesterTypeUseCase,
    UpdateSemesterTypeUseCase,
    DeleteSemesterTypeUseCase,
  ],
  exports: [ISemesterTypeRepository],
})
export class SemesterTypeModule {}
