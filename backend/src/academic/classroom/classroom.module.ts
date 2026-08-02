import { Module } from '@nestjs/common';
import { ClassroomController } from './presentation/classroom.controller.js';
import { ClassroomStructureController } from './presentation/classroom-structure.controller.js';
import { ClassroomSupervisorController } from './presentation/classroom-supervisor.controller.js';
import { IClassroomRepository } from './domain/interfaces/classroom-repository.interface.js';
import { IClassroomStructureRepository } from './domain/interfaces/classroom-structure-repository.interface.js';
import { IClassroomSupervisorRepository } from './domain/interfaces/classroom-supervisor-repository.interface.js';
import { PrismaClassroomRepository } from './infrastructure/persistence/prisma-classroom.repository.js';
import { PrismaClassroomStructureRepository } from './infrastructure/persistence/prisma-classroom-structure.repository.js';
import { PrismaClassroomSupervisorRepository } from './infrastructure/persistence/prisma-classroom-supervisor.repository.js';
import { CreateClassroomUseCase } from './use-cases/create-classroom.use-case.js';
import { DeleteClassroomUseCase } from './use-cases/delete-classroom.use-case.js';
import { GetClassroomByIdUseCase } from './use-cases/get-classroom-by-id.use-case.js';
import { GetClassroomsUseCase } from './use-cases/get-classrooms.use-case.js';
import { UpdateClassroomUseCase } from './use-cases/update-classroom.use-case.js';
import { CreateClassroomStructureUseCase } from './use-cases/create-classroom-structure.use-case.js';
import { DeleteClassroomStructureUseCase } from './use-cases/delete-classroom-structure.use-case.js';
import { GetClassroomStructuresUseCase } from './use-cases/get-classroom-structures.use-case.js';
import { UpdateClassroomStructureUseCase } from './use-cases/update-classroom-structure.use-case.js';
import { CreateClassroomSupervisorUseCase } from './use-cases/create-classroom-supervisor.use-case.js';
import { DeleteClassroomSupervisorUseCase } from './use-cases/delete-classroom-supervisor.use-case.js';
import { GetClassroomSupervisorByIdUseCase } from './use-cases/get-classroom-supervisor-by-id.use-case.js';
import { GetClassroomSupervisorsUseCase } from './use-cases/get-classroom-supervisors.use-case.js';
import { UpdateClassroomSupervisorUseCase } from './use-cases/update-classroom-supervisor.use-case.js';

@Module({
  controllers: [
    ClassroomController,
    ClassroomStructureController,
    ClassroomSupervisorController,
  ],
  providers: [
    { provide: IClassroomRepository, useClass: PrismaClassroomRepository },
    {
      provide: IClassroomStructureRepository,
      useClass: PrismaClassroomStructureRepository,
    },
    {
      provide: IClassroomSupervisorRepository,
      useClass: PrismaClassroomSupervisorRepository,
    },
    CreateClassroomUseCase,
    DeleteClassroomUseCase,
    GetClassroomByIdUseCase,
    GetClassroomsUseCase,
    UpdateClassroomUseCase,
    CreateClassroomStructureUseCase,
    DeleteClassroomStructureUseCase,
    GetClassroomStructuresUseCase,
    UpdateClassroomStructureUseCase,
    CreateClassroomSupervisorUseCase,
    DeleteClassroomSupervisorUseCase,
    GetClassroomSupervisorByIdUseCase,
    GetClassroomSupervisorsUseCase,
    UpdateClassroomSupervisorUseCase,
  ],
  exports: [
    IClassroomRepository,
    IClassroomStructureRepository,
    IClassroomSupervisorRepository,
  ],
})
export class ClassroomModule {}
