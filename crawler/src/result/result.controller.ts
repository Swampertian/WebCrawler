import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ResultService } from './result.service';

@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.resultService.stream();
  }
}
