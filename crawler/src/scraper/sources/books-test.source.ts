import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export const BooksTestSource: SourceConfig = {
  id: 'books-test',
  name: 'Books to Scrape (TEST)',
  url: 'https://books.toscrape.com',
  engine: 'cheerio',
  selectors: {
    items: 'div.side_categories',
    fields: {
      url:   { selector: 'a', attr: 'href' },
      // title: { selector: 'h3 a', attr: 'title' },
      // price: { selector: '.price_color', attr: 'text' },
    },
  },
  keywords: ['Mystery'] ,
  keywordFields: ['title'],
  pagination: {
    type: 'url',
    paramName: 'page',
    maxPages: 1,
  },
};
