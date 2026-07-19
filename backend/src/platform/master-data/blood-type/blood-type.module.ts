import { Module } from '@nestjs/common';
import { BloodTypeController } from './presentation/blood-type.controller.js';
import { PrismaBloodTypeRepository } from './infrastructure/persistence/prisma-blood-type.repository.js';
import { IBloodTypeRepository } from './domain/interfaces/blood-type-repository.interface.js';
import { CreateBloodTypeUseCase } from './use-cases/create-blood-type.use-case.js';
import { DeleteBloodTypeUseCase } from './use-cases/delete-blood-type.use-case.js';
import { GetBloodTypeByIdUseCase } from './use-cases/get-blood-type-by-id.use-case.js';
import { GetBloodTypesUseCase } from './use-cases/get-blood-types.use-case.js';
import { UpdateBloodTypeUseCase } from './use-cases/update-blood-type.use-case.js';

@Module({
  controllers: [BloodTypeController],
  providers: [
    { provide: IBloodTypeRepository, useClass: PrismaBloodTypeRepository },
    GetBloodTypesUseCase,
    GetBloodTypeByIdUseCase,
    CreateBloodTypeUseCase,
    UpdateBloodTypeUseCase,
    DeleteBloodTypeUseCase,
  ],
  exports: [IBloodTypeRepository],
})
export class BloodTypeModule {}
