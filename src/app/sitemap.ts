export default function sitemap() {
  const baseUrl = 'https://luhn.se';
  const routes = [
    '',
    '/personnummer',
    '/samordningsnummer',
    '/organisation',
    '/bankgiro',
    '/bank-account',
    '/ocr',
    '/validator',
    '/validator/personnummer',
    '/validator/organisation',
    '/validator/moms',
    '/validator/bankgiro',
    '/validator/bankkonto',
    '/api-docs',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}