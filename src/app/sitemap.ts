import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://luhn.se';
  const routes = [
    '',
    '/personnummer',
    '/samordningsnummer',
    '/organisation',
    '/swish',
    '/mobile',
    '/car-plate',
    '/bankgiro',
    '/plusgiro',
    '/bank-account',
    '/ocr',
    '/validator',
    '/validator/personnummer',
    '/validator/organisation',
    '/validator/moms',
    '/validator/adress',
    '/validator/swish',
    '/validator/bankgiro',
    '/validator/plusgiro',
    '/validator/bankkonto',
    '/validator/car-plate',
    '/api-docs',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
