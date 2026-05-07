import { SourceConfig } from '../../source-config/interfaces/source-config.interface';
import { PncpSource } from './pncp.source';
import { BooksTestSource } from './books-test.source';

export const SOURCE_REGISTRY: Record<string, SourceConfig> = {
  // [PncpSource.id]: PncpSource,
  [BooksTestSource.id]: BooksTestSource,
};
