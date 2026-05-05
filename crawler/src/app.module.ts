import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [DatabaseModule, SchedulerModule],
})
export class AppModule {}
