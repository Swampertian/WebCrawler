import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export interface ScrapedItem {
  url: string;
  title: string;
  date?: string;
  metadata?: Record<string, unknown>;
}

export interface Engine {
  scrape(config: SourceConfig): Promise<ScrapedItem[]>;
}
