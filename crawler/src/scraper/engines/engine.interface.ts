import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export interface ScrapedItem {
  url: string;
  fields: Record<string, string>;
}

export interface Engine {
  scrape(config: SourceConfig): AsyncGenerator<ScrapedItem[]>;
}
