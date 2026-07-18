import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://funilcomercial.com';

const PUBLIC_ROUTES = [
  '/',
  '/crm',
  '/consultoria',
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
  '/estrutura-de-vendas-para-nutricionistas',
  '/estrutura-de-vendas-para-psicologas',
  '/estrutura-de-vendas-para-dentistas',
  '/estrutura-de-vendas-para-terapeutas',
  '/estrutura-de-vendas-para-massoterapeutas',
  '/estrutura-de-vendas-para-advogados',
  '/estrutura-de-vendas-para-arquitetos',
  '/estrutura-de-vendas-para-contabilidade',
  '/estrutura-de-vendas-para-estetica',
  '/blog'
];

const locationsPath = path.join(__dirname, '..', 'src', 'lib', 'seoLocations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const TARGET_CITIES = locationsData.TARGET_CITIES;
const NICHES = locationsData.NICHES.map(n => n.slug);

function generateUrlNode(route, priority, freq) {
  return `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Core Sitemap
  let coreUrls = PUBLIC_ROUTES.map(route => 
    generateUrlNode(route, route === '/' ? '1.0' : '0.8', 'weekly')
  ).join('');
  
  const coreSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${coreUrls}\n</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-core.xml'), coreSitemap);

  // 2. Local Sitemap
  let localUrls = '';
  let localRouteCount = 0;
  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      localRouteCount++;
      localUrls += generateUrlNode(`/local/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly');
      
      // Commercial Intent Routes
      localRouteCount += 3;
      localUrls += generateUrlNode(`/agencia-de-marketing/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly');
      localUrls += generateUrlNode(`/empresa-de-captacao/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly');
      localUrls += generateUrlNode(`/melhor-crm/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly');
    });
  });
  
  const localSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${localUrls}\n</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-local.xml'), localSitemap);

  // 3. Blog Sitemap (Manual + Programmatic)
  const blogDataPath = path.join(__dirname, '..', 'src', 'lib', 'blogData.ts');
  let blogUrls = '';
  let blogRouteCount = 0;
  
  if (fs.existsSync(blogDataPath)) {
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
    const blogSlugs = [...blogDataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
    
    blogSlugs.forEach(slug => {
      blogRouteCount++;
      blogUrls += generateUrlNode(`/blog/${slug}`, '0.8', 'weekly');
    });
  }

  // Injecting Programmatic Blog Posts (Guias de Vendas)
  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      blogRouteCount++;
      blogUrls += generateUrlNode(`/blog/guia-de-vendas/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly');
    });
  });

  const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${blogUrls}\n</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), blogSitemap);

  // 4. Glossary Sitemap
  const glossarioDataPath = path.join(__dirname, '..', 'src', 'lib', 'glossarioData.ts');
  let glossarioUrls = '';
  let glossarioRouteCount = 0;

  glossarioRouteCount++;
  glossarioUrls += generateUrlNode(`/glossario`, '0.8', 'weekly');
  
  if (fs.existsSync(glossarioDataPath)) {
    const glossarioDataContent = fs.readFileSync(glossarioDataPath, 'utf8');
    const glossarioSlugs = [...glossarioDataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
    
    glossarioSlugs.forEach(slug => {
      glossarioRouteCount++;
      glossarioUrls += generateUrlNode(`/glossario/${slug}`, '0.7', 'monthly');
    });
  }

  const glossarioSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${glossarioUrls}\n</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-glossario.xml'), glossarioSitemap);

  // 5. Sitemap Index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap-core.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-local.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-blog.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-glossario.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
  
  console.log(`✅ Sitemap Index successfully generated at ${path.join(publicDir, 'sitemap.xml')}`);
  console.log(`🚀 Total Core routes: ${PUBLIC_ROUTES.length}`);
  console.log(`🚀 Total Local SEO routes: ${localRouteCount}`);
  console.log(`🚀 Total Blog routes: ${blogRouteCount}`);
  console.log(`🚀 Total Glossario routes: ${glossarioRouteCount}`);
}

generateSitemap();
