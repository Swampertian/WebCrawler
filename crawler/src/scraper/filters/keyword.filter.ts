import { Injectable } from '@nestjs/common';
import { ScrapedItem } from '../engines/engine.interface';

export interface FilteredItem extends ScrapedItem {
  matchedKeywords: string[];
}

@Injectable()
export class KeywordFilter {
  filter(items: ScrapedItem[], keywords: string[]): FilteredItem[] {
    const lower = keywords.map((k) => k.toLowerCase());

    return items.reduce<FilteredItem[]>((acc, item) => {
      const haystack = `${item.title}`.toLowerCase();
      const matched = lower.filter((kw) => haystack.includes(kw));
      if (matched.length) {
        acc.push({ ...item, matchedKeywords: matched });
      }
      return acc;
    }, []);
  }
}
