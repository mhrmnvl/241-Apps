import { Module } from '@nestjs/common';
import { ClassroomController } from './presentation/classroom.controller.js';
import { ClassroomStructuresController } from './presentation/classroom-structures.controller.js';
import { ClassroomSupervisorsController } from './presentation/classroom-supervisors.controller.js';
import { ClassroomRepository } from './repositories/classroom.repository.js';
import { ClassroomStructureRepository } from './repositories/classroom-structures.repository.js';
import { ClassroomSupervisorRepository } from './repositories/classroom-supervisors.repository.js';
import { IClassroomRepository } from './domain/interfaces/classroom-repository.interface.js';
import { PrismaClassroomRepository } from './infrastructure/persistence/prisma-classroom.repository.js';
import { PrismaClassroomStructureRepository } from './infrastructure/persistence/prisma-classroom-structures.repository.js';
import { PrismaClassroomSupervisorRepository } from './infrastructure/persistence/prisma-classroom-supervisors.repository.js';
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
    ClassroomStructuresController,
    ClassroomSupervisorsController,
  ],
  providers: [
    { provide: IClassroomRepository, useClass: PrismaClassroomRepository },
    { provide: ClassroomRepository, useClass: PrismaClassroomRepository },
    {
      provide: ClassroomStructureRepository,
      useClass: PrismaClassroomStructureRepository,
    },
    {
      provide: ClassroomSupervisorRepository,
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
    ClassroomRepository,
    ClassroomStructureRepository,
    ClassroomSupervisorRepository,
  ],
})
export class ClassroomModule {}
