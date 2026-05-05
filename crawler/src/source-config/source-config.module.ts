import { Module } from '@nestjs/common';
import { SourceConfigService } from './source-config.service';

@Module({
  providers: [SourceConfigService],
  exports: [SourceConfigService],
})
export class SourceConfigModule {}
