export type EngineType = 'cheerio' | 'playwright';

export interface SelectorConfig {
  items: string;
  title: string;
  link: string;
  date?: string;
}

export interface PaginationConfig {
  type: 'button' | 'url';
  selector?: string;
  paramName?: string;
  maxPages: number;
}

export interface SourceConfig {
  id: string;
  name: string;
  url: string;
  engine: EngineType;
  schedule: string;
  selectors: SelectorConfig;
  keywords: string[];
  pagination?: PaginationConfig;
}
