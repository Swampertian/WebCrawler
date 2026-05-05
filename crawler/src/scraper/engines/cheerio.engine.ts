import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourceConfig } from '../../source-config/interfaces/source-config.interface';
import { Engine, ScrapedItem } from './engine.interface';

@Injectable()
export class CheerioEngine implements Engine {
  private readonly logger = new Logger(CheerioEngine.name);

  async scrape(config: SourceConfig): Promise<ScrapedItem[]> {
    const items: ScrapedItem[] = [];
    let page = 1;
    const maxPages = config.pagination?.maxPages ?? 1;

    while (page <= maxPages) {
      const url = this.buildUrl(config, page);
      const html = await this.fetch(url);
      if (!html) break;

      const $ = cheerio.load(html);
      const elements = $(config.selectors.items);

      if (!elements.length) break;

      elements.each((_, el) => {
        const title = $(el).find(config.selectors.title).text().trim();
        const href = $(el).find(config.selectors.link).attr('href') ?? '';
        const date = config.selectors.date
          ? $(el).find(config.selectors.date).text().trim()
          : undefined;

        const resolvedUrl = href.startsWith('http')
          ? href
          : new URL(href, config.url).toString();

        if (resolvedUrl) {
          items.push({ url: resolvedUrl, title, date });
        }
      });

      page++;
    }

    this.logger.log(`[${config.id}] cheerio scraped ${items.length} items`);
    return items;
  }

  private buildUrl(config: SourceConfig, page: number): string {
    if (!config.pagination || config.pagination.type !== 'url' || page === 1) {
      return config.url;
    }
    const param = config.pagination.paramName ?? 'page';
    const separator = config.url.includes('?') ? '&' : '?';
    return `${config.url}${separator}${param}=${page}`;
  }

  private async fetch(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)' },
      });
      if (!res.ok) return null;
      return res.text();
    } catch (err) {
      this.logger.error(`Fetch failed: ${url}`, err);
      return null;
    }
  }
}
