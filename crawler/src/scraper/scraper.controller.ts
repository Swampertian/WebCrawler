import { Controller, NotFoundException, Param, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { SOURCE_REGISTRY } from './sources/source.registry';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run/:sourceId')
  run(@Param('sourceId') sourceId: string) {
    const source = SOURCE_REGISTRY[sourceId];
    if (!source) throw new NotFoundException(`Source '${sourceId}' not found`);
    void this.scraperService.run(source);
    return { status: 'started', sourceId };
  }
}
