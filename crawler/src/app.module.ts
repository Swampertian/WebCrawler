import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [DatabaseModule, ScraperModule],
})
export class AppModule {}
