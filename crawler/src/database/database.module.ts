import { Global, Module } from '@nestjs/common';
import Database from 'better-sqlite3';
import { join } from 'path';

export const DB = 'SQLITE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () => {
        const db = new Database(join(process.cwd(), 'crawler.db'));
        return db;
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
