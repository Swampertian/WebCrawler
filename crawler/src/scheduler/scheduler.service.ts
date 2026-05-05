import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SourceConfigService } from '../source-config/source-config.service';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly sourceConfigService: SourceConfigService,
    private readonly scraperService: ScraperService,
  ) {}

  onApplicationBootstrap() {
    const sources = this.sourceConfigService.getAll();

    for (const source of sources) {
      const job = new CronJob(source.schedule, () =>
        this.scraperService.run(source).catch((err) =>
          this.logger.error(`[${source.id}] job failed`, err),
        ),
      );

      this.schedulerRegistry.addCronJob(source.id, job);
      job.start();
      this.logger.log(`[${source.id}] scheduled: ${source.schedule}`);
    }
  }
}
