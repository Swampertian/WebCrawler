import { Injectable, Logger } from '@nestjs/common';
import { SourceConfig } from '../source-config/interfaces/source-config.interface';
import { CheerioEngine } from './engines/cheerio.engine';
import { PlaywrightEngine } from './engines/playwright.engine';
import { ResultService } from '../result/result.service';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly cheerioEngine: CheerioEngine,
    private readonly playwrightEngine: PlaywrightEngine,
    private readonly resultService: ResultService,
  ) {}

  async run(config: SourceConfig): Promise<void> {
    this.logger.log(`[${config.id}] start`);
    this.resultService.emit({ type: 'job_start', sourceId: config.id });

    const engine = config.engine === 'playwright' ? this.playwrightEngine : this.cheerioEngine;
    let total = 0;

    for await (const items of engine.scrape(config)) {
      this.resultService.saveMany(
        items.map((item) => ({ url: item.url, sourceId: config.id, fields: item.fields })),
      );
      total += items.length;
    }

    this.resultService.emit({ type: 'job_done', sourceId: config.id, payload: { total } });
    this.logger.log(`[${config.id}] done: ${total} saved`);
  }
}
