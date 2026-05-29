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
      const dtos = items.map((item) => ({ url: item.url, sourceId: config.id, fields: item.fields }));
      this.resultService.saveMany(dtos);
      for (const dto of dtos) this.logger.log(`[${config.id}] saving: ${dto.url}`);
      total += items.length;
    }

    const unique = this.resultService.countBySource(config.id);
    this.resultService.emit({ type: 'job_done', sourceId: config.id, payload: { total } });
    this.logger.log(`[${config.id}] done: ${total} scraped, ${unique} total unique in db`);
  }
}
