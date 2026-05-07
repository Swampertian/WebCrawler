import { Injectable, Logger } from '@nestjs/common';
import { SourceConfig } from '../source-config/interfaces/source-config.interface';
import { CheerioEngine } from './engines/cheerio.engine';
import { PlaywrightEngine } from './engines/playwright.engine';
import { KeywordFilter } from './filters/keyword.filter';
import { ResultService } from '../result/result.service';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly cheerioEngine: CheerioEngine,
    private readonly playwrightEngine: PlaywrightEngine,
    private readonly keywordFilter: KeywordFilter,
    private readonly resultService: ResultService,
  ) {}

  async run(config: SourceConfig): Promise<void> {
    this.logger.log(`[${config.id}] start`);
    this.resultService.emit({ type: 'job_start', sourceId: config.id });

    const engine =
      config.engine === 'playwright' ? this.playwrightEngine : this.cheerioEngine;

    const items = await engine.scrape(config);
    const filtered = this.keywordFilter.filter(items, config.keywords, config.keywordFields);

    await this.resultService.saveMany(
      filtered.map((item) => ({
        url: item.url,
        sourceId: config.id,
        matchedKeywords: item.matchedKeywords,
        matchedFields: item.matchedFields,
        fields: item.fields,
      })),
    );

    this.resultService.emit({
      type: 'job_done',
      sourceId: config.id,
      payload: { total: filtered.length },
    });

    this.logger.log(`[${config.id}] done ${filtered.length}/${items.length}`);
  }
}
