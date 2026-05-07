export interface EventDto {
  type: 'job_start' | 'item_saved' | 'job_done';
  sourceId: string;
  payload?: Record<string, unknown>;
}
