export interface CreateResultDto {
  url: string;
  sourceId: string;
  matchedKeywords: string[];
  matchedFields: string[];
  fields: Record<string, string>;
}
