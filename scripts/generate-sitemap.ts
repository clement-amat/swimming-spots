import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE_URL = 'https://ca-baigne.com';
const today = new Date().toISOString().split('T')[0];

interface SpotProperties {
  code: string;
  slug: string;
  siteDetails?: { lastTestDate?: string };
}

interface GeoJSON {
  features: Array<{ properties: SpotProperties }>;
}

const geojson: GeoJSON = JSON.parse(readFileSync(join(root, 'public/geojson.json'), 'utf-8'));
const landingSlugs: string[] = readdirSync(join(root, 'public/landing-pages'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''));

function urlEntry(loc: string, priority: string, changefreq: string, lastmod = today): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries: string[] = [
  urlEntry(`${BASE_URL}/`, '1.0', 'weekly'),
  ...landingSlugs.map((slug) => urlEntry(`${BASE_URL}/p/${slug}`, '0.8', 'monthly')),
  ...geojson.features.map((f) => {
    const lastmod = f.properties.siteDetails?.lastTestDate
      ? f.properties.siteDetails.lastTestDate.split('T')[0]
      : today;
    return urlEntry(`${BASE_URL}/spot/${f.properties.slug}`, '0.6', 'weekly', lastmod);
  }),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

writeFileSync(join(root, 'public/sitemap.xml'), sitemap, 'utf-8');
console.log(`Sitemap generated: ${entries.length} URLs`);
