import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true })
export class Result {
  @Prop({ required: true, unique: true, index: true })
  url!: string;

  @Prop({ required: true })
  sourceId!: string;

  @Prop({ type: [String], default: [] })
  matchedKeywords!: string[];

  @Prop({ type: [String], default: [] })
  matchedFields!: string[];

  @Prop({ type: Object, default: {} })
  fields!: Record<string, string>;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
