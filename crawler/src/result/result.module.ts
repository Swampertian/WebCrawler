import { Module } from '@nestjs/common';
import { ResultRepository } from './result.repository';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';

@Module({
  providers: [ResultRepository, ResultService],
  exports: [ResultRepository, ResultService],
  controllers: [ResultController],
})
export class ResultModule {}
