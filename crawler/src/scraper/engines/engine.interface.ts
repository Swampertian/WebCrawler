import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export interface ScrapedItem {
  url: string;
  fields: Record<string, string>;
}

export interface FilteredItem extends ScrapedItem {
  matchedKeywords: string[];
  matchedFields: string[];
}

export interface Engine {
  scrape(config: SourceConfig): Promise<ScrapedItem[]>;
}
