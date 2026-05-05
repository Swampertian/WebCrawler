import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { SourceConfig } from './interfaces/source-config.interface';

@Injectable()
export class SourceConfigService implements OnModuleInit {
  private readonly logger = new Logger(SourceConfigService.name);
  private sources: SourceConfig[] = [];

  private readonly configsDir = join(process.cwd(), 'configs', 'sources');

  onModuleInit() {
    this.load();
  }

  private load() {
    const files = readdirSync(this.configsDir).filter((f) =>
      f.endsWith('.json'),
    );
    this.sources = files.map((file) => {
      const raw = readFileSync(join(this.configsDir, file), 'utf-8');
      return JSON.parse(raw) as SourceConfig;
    });
    this.logger.log(`Loaded ${this.sources.length} source config(s)`);
  }

  getAll(): SourceConfig[] {
    return this.sources;
  }

  getById(id: string): SourceConfig | undefined {
    return this.sources.find((s) => s.id === id);
  }
}
