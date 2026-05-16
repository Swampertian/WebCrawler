export interface Result {
  url: string;
  sourceId: string;
  fields: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}
