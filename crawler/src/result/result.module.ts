import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from './schemas/result.schema';
import { ResultRepository } from './result.repository';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  providers: [ResultRepository, ResultService],
  exports: [ResultRepository, ResultService],
  controllers: [ResultController],
})
export class ResultModule {}
