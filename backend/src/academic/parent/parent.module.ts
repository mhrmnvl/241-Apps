import { Module } from '@nestjs/common';
import { ParentController } from './presentation/parent.controller.js';
import { ParentRepository } from './repositories/parent.repository.js';
import { PrismaParentRepository } from './infrastructure/persistence/prisma-parent.repository.js';
import { CreateParentUseCase } from './use-cases/create-parent.use-case.js';
import { DeleteParentUseCase } from './use-cases/delete-parent.use-case.js';
import { GetParentByIdUseCase } from './use-cases/get-parent-by-id.use-case.js';
import { GetParentsUseCase } from './use-cases/get-parents.use-case.js';
import { UpdateParentUseCase } from './use-cases/update-parent.use-case.js';

@Module({
  controllers: [ParentController],
  providers: [
    { provide: ParentRepository, useClass: PrismaParentRepository },
    GetParentsUseCase,
    GetParentByIdUseCase,
    CreateParentUseCase,
    UpdateParentUseCase,
    DeleteParentUseCase,
  ],
  exports: [ParentRepository],
})
export class ParentModule {}
