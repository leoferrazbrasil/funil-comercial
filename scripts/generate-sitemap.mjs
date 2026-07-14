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
  '/site-para-psicologas',
  '/cidades-atendidas',
  '/blog'
];

const locationsPath = path.join(__dirname, '..', 'src', 'lib', 'seoLocations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const TARGET_CITIES = locationsData.TARGET_CITIES;
const NICHES = locationsData.NICHES.map(n => n.slug);

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
  let localRouteCount = 0;
  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      localRouteCount++;
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

  // Generate Blog SEO URLs
  const blogDataPath = path.join(__dirname, '..', 'src', 'lib', 'blogData.ts');
  let blogRouteCount = 0;
  if (fs.existsSync(blogDataPath)) {
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
    const blogSlugs = [...blogDataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
    
    blogSlugs.forEach(slug => {
      blogRouteCount++;
      const route = `/blog/${slug}`;
      urls += `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  }

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
  console.log(`🚀 Total Local SEO routes injected: ${localRouteCount}`);
  console.log(`🚀 Total Blog routes injected: ${blogRouteCount}`);
}

generateSitemap();
