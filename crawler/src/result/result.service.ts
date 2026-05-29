import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ResultRepository } from './result.repository';
import { CreateResultDto } from './interface/CreateResultDto';
import { EventDto } from './interface/EventDto';

@Injectable()
export class ResultService {
  private readonly events$ = new Subject<EventDto>();

  constructor(private readonly resultRepository: ResultRepository) {}

  stream(): Observable<MessageEvent> {
    return new Observable((observer) => {
      const sub = this.events$.subscribe({
        next: (event) => observer.next({ data: event } as MessageEvent),
        error: (err) => observer.error(err),
      });
      return () => sub.unsubscribe();
    });
  }

  emit(event: EventDto): void {
    this.events$.next(event);
  }

  saveMany(dtos: CreateResultDto[]): void {
    if (!dtos.length) return;
    this.resultRepository.upsertMany(dtos);

    for (const dto of dtos) {
      this.emit({ type: 'item_saved', sourceId: dto.sourceId, payload: { url: dto.url, fields: dto.fields } });
    }
  }

  countBySource(sourceId: string): number {
    return this.resultRepository.countBySource(sourceId);
  }
}
