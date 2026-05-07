import { Injectable, Logger } from '@nestjs/common';
import { chromium, Page } from 'playwright';
import {
  Interaction,
  SourceConfig,
} from '../../source-config/interfaces/source-config.interface';
import { Engine, ScrapedItem } from './engine.interface';

@Injectable()
export class PlaywrightEngine implements Engine {
  private readonly logger = new Logger(PlaywrightEngine.name);

  async scrape(config: SourceConfig): Promise<ScrapedItem[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const items: ScrapedItem[] = [];
    const maxPages = config.pagination?.maxPages ?? 1;

    try {
      await page.goto(config.url, { waitUntil: 'networkidle' });

      if (config.interactions?.length) {
        await this.runInteractions(page, config.interactions);
      }

      for (let i = 0; i < maxPages; i++) {
        const elements = await page.$$(config.selectors.items);
        if (!elements.length) break;

        for (const el of elements) {
          const fields: Record<string, string> = {};

          for (const [name, fieldCfg] of Object.entries(config.selectors.fields)) {
            fields[name] = await el
              .$(fieldCfg.selector)
              .then((node) => {
                if (!node) return '';
                if (fieldCfg.attr === 'text') return node.textContent().then((t) => t?.trim() ?? '');
                if (fieldCfg.attr === 'html') return node.innerHTML().then((h) => h.trim());
                return node.getAttribute(fieldCfg.attr).then((a) => a ?? '');
              })
              .catch(() => '');
          }

          const rawUrl = fields['url'] ?? '';
          if (!rawUrl) continue;

          fields['url'] = rawUrl.startsWith('http')
            ? rawUrl
            : new URL(rawUrl, config.url).toString();

          items.push({ url: fields['url'], fields });
        }

        if (
          !config.pagination ||
          config.pagination.type !== 'button' ||
          i === maxPages - 1
        ) break;

        const next = await page.$(config.pagination.selector!);
        if (!next) break;
        await next.click();
        await page.waitForLoadState('networkidle');
      }
    } finally {
      await browser.close();
    }

    this.logger.log(`[${config.id}] playwright: ${items.length} items`);
    return items;
  }

  private async runInteractions(page: Page, interactions: Interaction[]): Promise<void> {
    for (const it of interactions) {
      if (it.action === 'click') {
        await page.click(it.selector).catch(() => {});
      } else if (it.action === 'wait') {
        await page.waitForSelector(it.selector).catch(() => {});
      } else if (it.action === 'scroll') {
        const times = it.times ?? 1;
        for (let i = 0; i < times; i++) {
          await page.click(it.selector).catch(() => {});
          await page.waitForLoadState('networkidle').catch(() => {});
        }
      }
    }
  }
}
