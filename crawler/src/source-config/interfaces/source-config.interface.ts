export type EngineType = 'cheerio' | 'playwright';

export interface FieldConfig {
  selector: string;
  attr: 'text' | 'html' | string;
}

export interface Interaction {
  action: 'click' | 'wait' | 'scroll';
  selector: string;
  times?: number;
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
  selectors: {
    items: string;
    fields: Record<string, FieldConfig>;
  };
  keywords: string[];
  keywordFields: string[];
  interactions?: Interaction[];
  pagination?: PaginationConfig;
}
