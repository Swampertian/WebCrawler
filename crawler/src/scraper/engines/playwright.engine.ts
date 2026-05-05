import { Injectable, Logger } from '@nestjs/common';
import { chromium } from 'playwright';
import { SourceConfig } from '../../source-config/interfaces/source-config.interface';
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

      for (let i = 0; i < maxPages; i++) {
        const elements = await page.$$(config.selectors.items);

        for (const el of elements) {
          const title = await el
            .$eval(config.selectors.title, (n) => n.textContent?.trim() ?? '')
            .catch(() => '');
          const href = await el
            .$eval(config.selectors.link, (n) =>
              n instanceof HTMLAnchorElement ? n.href : '',
            )
            .catch(() => '');
          const date =
            config.selectors.date
              ? await el
                  .$eval(
                    config.selectors.date,
                    (n) => n.textContent?.trim() ?? '',
                  )
                  .catch(() => undefined)
              : undefined;

          if (href) {
            items.push({ url: href, title, date });
          }
        }

        if (
          !config.pagination ||
          config.pagination.type !== 'button' ||
          i === maxPages - 1
        )
          break;

        const nextBtn = await page.$(config.pagination.selector!);
        if (!nextBtn) break;
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
      }
    } finally {
      await browser.close();
    }

    this.logger.log(`[${config.id}] playwright scraped ${items.length} items`);
    return items;
  }
}
