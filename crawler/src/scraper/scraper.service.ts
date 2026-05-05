import { Injectable, Logger } from '@nestjs/common';
import { SourceConfig } from '../source-config/interfaces/source-config.interface';
import { CheerioEngine } from './engines/cheerio.engine';
import { PlaywrightEngine } from './engines/playwright.engine';
import { KeywordFilter } from './filters/keyword.filter';
import { ResultRepository } from '../result/result.repository';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly cheerioEngine: CheerioEngine,
    private readonly playwrightEngine: PlaywrightEngine,
    private readonly keywordFilter: KeywordFilter,
    private readonly resultRepository: ResultRepository,
  ) {}

  async run(config: SourceConfig): Promise<void> {
    this.logger.log(`[${config.id}] start`);

    const engine =
      config.engine === 'playwright'
        ? this.playwrightEngine
        : this.cheerioEngine;

    const items = await engine.scrape(config);
    const filtered = this.keywordFilter.filter(items, config.keywords);

    await this.resultRepository.upsertMany(
      filtered.map((item) => ({
        url: item.url,
        sourceId: config.id,
        title: item.title,
        matchedKeywords: item.matchedKeywords,
        date: item.date,
        metadata: item.metadata ?? {},
      })),
    );

    this.logger.log(`[${config.id}] saved ${filtered.length}/${items.length}`);
  }
}
