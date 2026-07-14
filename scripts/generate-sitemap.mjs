import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://funilcomercial.com';

const PUBLIC_ROUTES = [
  '/',
  '/crm',
  '/brandbook',
  '/site-para-negocios-locais',
  '/diagnostico-estrutura-de-vendas',
  '/google-meu-negocio',
  '/trafego-pago-negocios-locais',
  '/crm-whatsapp-organizado',
  '/site-para-dentistas',
  '/site-para-nutricionistas',
  '/site-para-psicologas'
];

// Sample of major Brazilian cities for programmatic SEO
const TARGET_CITIES = [
  { estado: 'sp', cidade: 'sao-paulo' },
  { estado: 'sp', cidade: 'campinas' },
  { estado: 'rj', cidade: 'rio-de-janeiro' },
  { estado: 'mg', cidade: 'belo-horizonte' },
  { estado: 'pr', cidade: 'curitiba' }
];

const NICHES = ['dentistas', 'advogados', 'psicologas', 'nutricionistas'];

function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  let urls = PUBLIC_ROUTES.map(route => `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  // Generate local SEO URLs
  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      const route = `/local/${nicho}/${location.estado}/${location.cidade}`;
      urls += `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent);
  
  console.log(`✅ Sitemap successfully generated at ${sitemapPath}`);
}

generateSitemap();
