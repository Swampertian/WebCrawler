import { Injectable, Logger } from '@nestjs/common';
import { chromium, Page } from 'playwright';
import { Interaction, SourceConfig } from '../../source-config/interfaces/source-config.interface';
import { Engine, ScrapedItem } from './engine.interface';

@Injectable()
export class PlaywrightEngine implements Engine {
  private readonly logger = new Logger(PlaywrightEngine.name);

  async *scrape(config: SourceConfig): AsyncGenerator<ScrapedItem[]> {
    const proxyServer = process.env['PLAYWRIGHT_PROXY'];

    const ldPreload = process.env['LD_PRELOAD'];
    delete process.env['LD_PRELOAD'];
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--disable-dev-shm-usage'],
      ...(proxyServer && { proxy: { server: proxyServer } }),
    });
    if (ldPreload) process.env['LD_PRELOAD'] = ldPreload;
    const page = await browser.newPage();
    const maxPages = config.pagination?.maxPages ?? 1;

    try {
      await page.goto(config.url, { waitUntil: 'networkidle' });

      if (config.interactions?.length) {
        await this.runInteractions(page, config.interactions);
      }

      const filterRegex = (() => {
        if (!config.filter) return null;
        const clean = config.filter.pattern.split('|').map(s => s.trim()).filter(s => s.length > 0).join('|');
        this.logger.log(`[${config.id}] filter pattern: "${clean}"`);
        return clean ? new RegExp(clean, 'i') : null;
      })();

      let prevPageFingerprint = '';

      for (let i = 0; i < maxPages; i++) {
        if (i > 0) {
          if (config.pagination?.type === 'url') {
            const targetUrl = this.buildUrl(config, i + 1);
            this.logger.log(`[${config.id}] navigating to: ${targetUrl}`);
            await page.goto(targetUrl, { waitUntil: 'networkidle' });
            const actualUrl = page.url();
            this.logger.log(`[${config.id}] landed on: ${actualUrl}`);
            await page.waitForSelector(config.selectors.items, { state: 'visible', timeout: 10000 }).catch(() => {});
            const fingerprint = await page.$eval(config.selectors.items, (el) => el.getAttribute('href') ?? el.textContent ?? '').catch(() => '');
            this.logger.log(`[${config.id}] page ${i + 1} fingerprint: "${fingerprint.slice(0, 80)}" | prev: "${prevPageFingerprint.slice(0, 80)}"`);
            if (fingerprint && fingerprint === prevPageFingerprint) {
              this.logger.log(`[${config.id}] duplicate page at ${i + 1}, stopping`);
              break;
            }
            prevPageFingerprint = fingerprint;
          } else if (config.pagination?.type === 'button') {
            const next = await page.$(config.pagination.selector!);
            if (!next) {
              this.logger.warn(`[${config.id}] next-page button not found: "${config.pagination.selector}"`);
              const dump = await page.evaluate(() => {
                const el = document.querySelector('pncp-pagination');
                if (!el) return 'pncp-pagination element not found in DOM';
                return el.innerHTML.replace(/\s+/g, ' ').slice(0, 2000);
              }).catch(() => 'evaluate failed');
              this.logger.warn(`[${config.id}] pncp-pagination innerHTML: ${dump}`);
              break;
            }
            this.logger.log(`[${config.id}] clicking next page (page ${i + 1} → ${i + 2})`);
            const prevHref = await page
              .$eval(config.selectors.items, (el) => el.getAttribute('href') ?? el.textContent ?? '')
              .catch(() => '');
            await next.click();
            await page.waitForLoadState('networkidle').catch(() => {});
            const changed = await page.waitForFunction(
              ({ sel, prev }) => {
                const el = document.querySelector(sel);
                return !!el && (el.getAttribute('href') ?? el.textContent ?? '') !== prev;
              },
              { sel: config.selectors.items, prev: prevHref },
              { timeout: 15000 },
            ).then(() => true).catch(() => false);
            this.logger.log(`[${config.id}] page changed: ${changed} (prevHref: "${prevHref.slice(0, 60)}")`);
          }
        }

        const baseUrl = page.url();
        const elements = await page.$$(config.selectors.items);
        if (!elements.length) break;

        if (i === 0 && config.pagination?.type === 'url') {
          prevPageFingerprint = await page.$eval(config.selectors.items, (el) => el.getAttribute('href') ?? el.textContent ?? '').catch(() => '');
        }

        const items: ScrapedItem[] = [];

        for (const el of elements) {
          const fields: Record<string, string> = {};

          for (const [name, fieldCfg] of Object.entries(config.selectors.fields)) {
            const isSelf = fieldCfg.selector === ':self';
            fields[name] = await (isSelf ? Promise.resolve(el) : el.$(fieldCfg.selector))
              .then((node) => {
                if (!node) return '';
                if (fieldCfg.attr === 'text') return node.textContent().then((t) => t?.trim() ?? '');
                if (fieldCfg.attr === 'html') return node.innerHTML().then((h) => h.trim());
                return node.getAttribute(fieldCfg.attr).then((a) => a ?? '');
              })
              .catch(() => '');
          }

          if (filterRegex) {
            const value = fields[config.filter!.field] ?? '';
            const pass = value.length > 0 && filterRegex.test(value);
            this.logger.log(`[${config.id}] filter ${pass ? 'PASS' : 'SKIP'}: "${value.slice(0, 100)}"`);
            if (!pass) continue;
          }

          const rawUrl = fields['url'] ?? '';
          if (!rawUrl) continue;

          fields['url'] = rawUrl.startsWith('http')
            ? rawUrl
            : new URL(rawUrl, baseUrl).toString();

          items.push({ url: fields['url'], fields });
        }

        this.logger.log(`[${config.id}] page ${i + 1}: ${items.length} items`);
        if (items.length) yield items;

        if (!config.pagination || i === maxPages - 1) break;
      }
    } finally {
      await browser.close();
    }
  }

  private buildUrl(config: SourceConfig, pageNum: number): string {
    const param = config.pagination?.paramName ?? 'page';
    const sep = config.url.includes('?') ? '&' : '?';
    return `${config.url}${sep}${param}=${pageNum}`;
  }

  private async runInteractions(page: Page, interactions: Interaction[]): Promise<void> {
    for (const it of interactions) {
      if (it.action === 'click') {
        const locator = it.text
          ? page.locator(it.selector, { hasText: it.text }).first()
          : page.locator(it.selector).first();
        await locator.click();
        await page.waitForLoadState('networkidle');
      } else if (it.action === 'wait') {
        await page.waitForSelector(it.selector).catch(() => {});
      } else if (it.action === 'scroll') {
        const times = it.times ?? 1;
        for (let i = 0; i < times; i++) {
          await page.mouse.wheel(0, 600);
          await page.waitForLoadState('networkidle').catch(() => {});
        }
      }
    }
  }
}
