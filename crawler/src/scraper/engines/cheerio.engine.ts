import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourceConfig } from '../../source-config/interfaces/source-config.interface';
import { Engine, ScrapedItem } from './engine.interface';

@Injectable()
export class CheerioEngine implements Engine {
  private readonly logger = new Logger(CheerioEngine.name);

  async *scrape(config: SourceConfig): AsyncGenerator<ScrapedItem[]> {
    const maxPages = config.pagination?.maxPages ?? 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = this.buildUrl(config, page);
      // Debug current IP before fetching the page
      await this.fetchVerify();
      const html = await this.fetch(url);
      this.logger.debug(`[${config.id}] fetched HTTP page ${page}: ${html ? 'success' : 'failed'}`);
      if (!html) break;

      const $ = cheerio.load(html);
      const items: ScrapedItem[] = [];

      $(config.selectors.items).each((index, el) => {
        const fields: Record<string, string> = {};

        for (const [name, fieldCfg] of Object.entries(config.selectors.fields)) {
          const node = $(el).find(fieldCfg.selector);
          fields[name] =
            fieldCfg.attr === 'text' ? node.text().trim()
            : fieldCfg.attr === 'html' ? (node.html()?.trim() ?? '')
            : (node.attr(fieldCfg.attr) ?? '');
        }

        const rawUrl = fields['url'] ?? '';
        const resolvedUrl = rawUrl
          ? (rawUrl.startsWith('http') ? rawUrl : new URL(rawUrl, url).toString())
          : `${url}#item-${page}-${index}`;

        fields['url'] = resolvedUrl;
        items.push({ url: resolvedUrl, fields });
      });

      this.logger.log(`[${config.id}] page ${page}: ${items.length} items`);
      if (items.length) yield items;
    }
  }

  private buildUrl(config: SourceConfig, page: number): string {
    if (!config.pagination || config.pagination.type !== 'url' || page === 1)
      return config.url;
    const param = config.pagination.paramName ?? 'page';
    const sep = config.url.includes('?') ? '&' : '?';
    return `${config.url}${sep}${param}=${page}`;
  }

  private async fetch(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      return res.ok ? res.text() : null;
    } catch (err) {
      this.logger.error(`fetch failed: ${url}`, err);
      return null;
    }
  }
  // Debug method to verify outgoing IP address 
  private async fetchVerify(){
    const res = await fetch("https://api.ipify.org?format=json")
    console.log(await res.json())
  }
}
