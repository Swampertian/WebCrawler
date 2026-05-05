import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SourceConfigModule } from '../source-config/source-config.module';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [ScheduleModule.forRoot(), SourceConfigModule, ScraperModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
