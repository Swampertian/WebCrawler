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
        const fields: Record<string, string> = {};

        for (const [name, fieldCfg] of Object.entries(config.selectors.fields)) {
          const node = $(el).find(fieldCfg.selector);
          fields[name] =
            fieldCfg.attr === 'text'
              ? node.text().trim()
              : fieldCfg.attr === 'html'
                ? (node.html()?.trim() ?? '')
                : (node.attr(fieldCfg.attr) ?? '');
        }

        const rawUrl = fields['url'] ?? '';
        if (!rawUrl) return;

        fields['url'] = rawUrl.startsWith('http')
          ? rawUrl
          : new URL(rawUrl, config.url).toString();

        items.push({ url: fields['url'], fields });
      });

      page++;
    }

    this.logger.log(`[${config.id}] cheerio: ${items.length} items`);
    return items;
  }

  private buildUrl(config: SourceConfig, page: number): string {
    if (!config.pagination || config.pagination.type !== 'url' || page === 1) {
      return config.url;
    }
    const param = config.pagination.paramName ?? 'page';
    const sep = config.url.includes('?') ? '&' : '?';
    return `${config.url}${sep}${param}=${page}`;
  }

  private async fetch(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!res.ok) return null;
      return res.text();
    } catch (err) {
      this.logger.error(`fetch failed: ${url}`, err);
      return null;
    }
  }
}
