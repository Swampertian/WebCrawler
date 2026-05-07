import { Injectable } from '@nestjs/common';
import { ScrapedItem, FilteredItem } from '../engines/engine.interface';

@Injectable()
export class KeywordFilter {
  filter(
    items: ScrapedItem[],
    keywords: string[],
    keywordFields: string[],
  ): FilteredItem[] {
    const lowerKw = keywords.map((k) => k.toLowerCase());

    return items.reduce<FilteredItem[]>((acc, item) => {
      const matchedKeywords: string[] = [];
      const matchedFields: string[] = [];

      for (const fieldName of keywordFields) {
        const value = (item.fields[fieldName] ?? '').toLowerCase();
        for (const kw of lowerKw) {
          if (value.includes(kw)) {
            if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
            if (!matchedFields.includes(fieldName)) matchedFields.push(fieldName);
          }
        }
      }

      if (matchedKeywords.length) {
        acc.push({ ...item, matchedKeywords, matchedFields });
      }
      return acc;
    }, []);
  }
}
