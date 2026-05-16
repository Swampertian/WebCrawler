import { Module } from '@nestjs/common';
import { CheerioEngine } from './engines/cheerio.engine';
import { PlaywrightEngine } from './engines/playwright.engine';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { ResultModule } from '../result/result.module';

@Module({
  imports: [ResultModule],
  providers: [CheerioEngine, PlaywrightEngine, ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
