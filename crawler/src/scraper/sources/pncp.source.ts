import { SourceConfig } from '../../source-config/interfaces/source-config.interface';

export const PncpSource: SourceConfig = {
  id: 'pncp',
  name: 'Portal Nacional de Contratações Públicas',
  url: 'https://pncp.gov.br/app/editais',
  engine: 'playwright',
  selectors: {
    items: '.edital-item',
    fields: {
      url:         { selector: 'a.edital-link',  attr: 'href' },
      title:       { selector: '.edital-titulo', attr: 'text' },
      date:        { selector: '.edital-data',   attr: 'text' },
      description: { selector: '.edital-resumo', attr: 'text' },
    },
  },
  keywords: ['TI', 'software', 'tecnologia', 'sistema'],
  keywordFields: ['title', 'description'],
  interactions: [
    { action: 'wait', selector: '.edital-item' },
  ],
  pagination: {
    type: 'button',
    selector: '.proximo-pagina',
    maxPages: 5,
  },
};
