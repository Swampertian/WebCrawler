import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import { DB } from '../database/database.module';
import { CreateResultDto } from './interface/CreateResultDto';

@Injectable()
export class ResultRepository implements OnModuleInit {
  private upsertStmt!: Database.Statement;

  constructor(@Inject(DB) private readonly db: Database.Database) {}

  onModuleInit() {
    this.db.exec(`  
        CREATE TABLE IF NOT EXISTS results (
          url TEXT PRIMARY KEY,
          sourceId TEXT NOT NULL,
          fields TEXT NOT NULL DEFAULT '{}',
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    this.upsertStmt = this.db.prepare(`
      INSERT INTO results (url, sourceId, fields)
      VALUES (@url, @sourceId, @fields)
      ON CONFLICT(url) DO UPDATE SET
        sourceId = excluded.sourceId,
        fields = excluded.fields,
        updatedAt = datetime('now')
    `);
  }

  upsert(dto: CreateResultDto): void {
    this.upsertStmt.run({
      url: dto.url,
      sourceId: dto.sourceId,
      fields: JSON.stringify(dto.fields),
    });
  }

  upsertMany(dtos: CreateResultDto[]): void {
    const tx = this.db.transaction((items: CreateResultDto[]) => {
      for (const dto of items) this.upsert(dto);
    });
    tx(dtos);
  }

  countBySource(sourceId: string): number {
    const row = this.db.prepare('SELECT COUNT(*) as c FROM results WHERE sourceId = ?').get(sourceId) as { c: number };
    return row.c;
  }
}
