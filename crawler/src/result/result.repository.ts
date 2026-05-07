import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument } from './schemas/result.schema';
import { CreateResultDto } from './interface/CreateResultDto';

@Injectable()
export class ResultRepository {
  constructor(
    @InjectModel(Result.name) private readonly model: Model<ResultDocument>,
  ) {}

  async upsert(dto: CreateResultDto): Promise<void> {
    await this.model.findOneAndUpdate(
      { url: dto.url },
      { $set: dto },
      { upsert: true, new: true },
    );
  }

  async upsertMany(dtos: CreateResultDto[]): Promise<void> {
    await Promise.all(dtos.map((dto) => this.upsert(dto)));
  }
}
