import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export const BooksTestPlaywrightSource: SourceConfig = {
  id: 'books-test-playwright',
  name: 'Books to Scrape - Mystery (Playwright)',
  url: 'https://books.toscrape.com',
  engine: 'playwright',
  selectors: {
    items: 'article.product_pod',
    fields: {
      url:   { selector: 'h3 a', attr: 'href' },
      title: { selector: 'h3 a', attr: 'title' },
      price: { selector: '.price_color', attr: 'text' },
    },
  },
  interactions: [
    { action: 'click', selector: 'ul.nav-list a', text: 'Mystery' },
  ],
  pagination: {
    type: 'url',
    paramName: 'page',
    maxPages: 1,
  },
};
