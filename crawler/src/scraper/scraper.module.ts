import { Module } from '@nestjs/common';
import { CheerioEngine } from './engines/cheerio.engine';
import { PlaywrightEngine } from './engines/playwright.engine';
import { KeywordFilter } from './filters/keyword.filter';
import { ScraperService } from './scraper.service';
import { ResultModule } from '../result/result.module';

@Module({
  imports: [ResultModule],
  providers: [CheerioEngine, PlaywrightEngine, KeywordFilter, ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
