import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      verboseMemoryLeak: true,
    }),
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}
