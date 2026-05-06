import { Controller,Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';


@Controller('results')
export class ResultController {
  @Sse('results')
    sendResults(): Observable <MessageEvent> {
        return new Observable((observer) => {
            const interval = setInterval(() => {
                const result = {
                    url: 'http://example.com',
                    status: 'crawled',
                    timestamp: new Date(),
                };
                observer.next({ data: result });
            }, 2000);
            
            return () => clearInterval(interval);
        });
    }
}

    