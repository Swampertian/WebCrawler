import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from './schemas/result.schema';
import { ResultRepository } from './result.repository';
import { ResultController } from './result.controller';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  providers: [ResultRepository],
  exports: [ResultRepository],
  controllers: [ResultController],  
})
export class ResultModule {}
