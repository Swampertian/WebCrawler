export type EngineType = 'cheerio' | 'playwright';

export interface FieldConfig {
  selector: string;
  attr: 'text' | 'html' | string;
}

export interface Interaction {
  action: 'click' | 'wait' | 'scroll';
  selector: string;
  text?: string;
  times?: number;
}

export interface PaginationConfig {
  type: 'button' | 'url';
  selector?: string;
  paramName?: string;
  maxPages: number;
}

export interface FilterConfig {
  field: string;
  pattern: string;
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
  filter?: FilterConfig;
  interactions?: Interaction[];
  pagination?: PaginationConfig;
}
