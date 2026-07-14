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

// Expanded list with 100 major Brazilian cities for programmatic SEO
const TARGET_CITIES = [
  // SP
  { estado: 'sp', cidade: 'sao-paulo' },
  { estado: 'sp', cidade: 'campinas' },
  { estado: 'sp', cidade: 'guarulhos' },
  { estado: 'sp', cidade: 'sao-bernardo-do-campo' },
  { estado: 'sp', cidade: 'santo-andre' },
  { estado: 'sp', cidade: 'osasco' },
  { estado: 'sp', cidade: 'sao-jose-dos-campos' },
  { estado: 'sp', cidade: 'ribeirao-preto' },
  { estado: 'sp', cidade: 'sorocaba' },
  { estado: 'sp', cidade: 'maua' },
  { estado: 'sp', cidade: 'sao-jose-do-rio-preto' },
  { estado: 'sp', cidade: 'santos' },
  { estado: 'sp', cidade: 'diadema' },
  { estado: 'sp', cidade: 'jundiai' },
  { estado: 'sp', cidade: 'piracicaba' },
  { estado: 'sp', cidade: 'carapicuiba' },
  { estado: 'sp', cidade: 'bauru' },
  { estado: 'sp', cidade: 'itaquaquecetuba' },
  { estado: 'sp', cidade: 'sao-vicente' },
  { estado: 'sp', cidade: 'franca' },
  { estado: 'sp', cidade: 'praia-grande' },
  { estado: 'sp', cidade: 'guaruja' },
  { estado: 'sp', cidade: 'taubate' },
  { estado: 'sp', cidade: 'suzano' },
  { estado: 'sp', cidade: 'limeira' },
  // RJ
  { estado: 'rj', cidade: 'rio-de-janeiro' },
  { estado: 'rj', cidade: 'sao-goncalo' },
  { estado: 'rj', cidade: 'duque-de-caxias' },
  { estado: 'rj', cidade: 'nova-iguacu' },
  { estado: 'rj', cidade: 'niteroi' },
  { estado: 'rj', cidade: 'belford-roxo' },
  { estado: 'rj', cidade: 'campos-dos-goytacazes' },
  { estado: 'rj', cidade: 'sao-joao-de-meriti' },
  { estado: 'rj', cidade: 'petropolis' },
  { estado: 'rj', cidade: 'volta-redonda' },
  { estado: 'rj', cidade: 'macae' },
  { estado: 'rj', cidade: 'mage' },
  // MG
  { estado: 'mg', cidade: 'belo-horizonte' },
  { estado: 'mg', cidade: 'uberlandia' },
  { estado: 'mg', cidade: 'contagem' },
  { estado: 'mg', cidade: 'juiz-de-fora' },
  { estado: 'mg', cidade: 'betim' },
  { estado: 'mg', cidade: 'montes-claros' },
  { estado: 'mg', cidade: 'ribeirao-das-neves' },
  { estado: 'mg', cidade: 'uberaba' },
  { estado: 'mg', cidade: 'governador-valadares' },
  { estado: 'mg', cidade: 'ipatinga' },
  { estado: 'mg', cidade: 'sete-lagoas' },
  { estado: 'mg', cidade: 'divinopolis' },
  // PR
  { estado: 'pr', cidade: 'curitiba' },
  { estado: 'pr', cidade: 'londrina' },
  { estado: 'pr', cidade: 'maringa' },
  { estado: 'pr', cidade: 'ponta-grossa' },
  { estado: 'pr', cidade: 'cascavel' },
  { estado: 'pr', cidade: 'sao-jose-dos-pinhais' },
  { estado: 'pr', cidade: 'foz-do-iguacu' },
  { estado: 'pr', cidade: 'colombo' },
  { estado: 'pr', cidade: 'guarapuava' },
  { estado: 'pr', cidade: 'paranagua' },
  // RS
  { estado: 'rs', cidade: 'porto-alegre' },
  { estado: 'rs', cidade: 'caxias-do-sul' },
  { estado: 'rs', cidade: 'canoas' },
  { estado: 'rs', cidade: 'pelotas' },
  { estado: 'rs', cidade: 'santa-maria' },
  { estado: 'rs', cidade: 'gravatai' },
  { estado: 'rs', cidade: 'viamao' },
  { estado: 'rs', cidade: 'novo-hamburgo' },
  { estado: 'rs', cidade: 'sao-leopoldo' },
  { estado: 'rs', cidade: 'rio-grande' },
  // SC
  { estado: 'sc', cidade: 'joinville' },
  { estado: 'sc', cidade: 'florianopolis' },
  { estado: 'sc', cidade: 'blumenau' },
  { estado: 'sc', cidade: 'sao-jose' },
  { estado: 'sc', cidade: 'chapeco' },
  { estado: 'sc', cidade: 'itajai' },
  { estado: 'sc', cidade: 'criciuma' },
  { estado: 'sc', cidade: 'jaragua-do-sul' },
  { estado: 'sc', cidade: 'palhoca' },
  { estado: 'sc', cidade: 'lages' },
  // ES
  { estado: 'es', cidade: 'serra' },
  { estado: 'es', cidade: 'vila-velha' },
  { estado: 'es', cidade: 'cariacica' },
  { estado: 'es', cidade: 'vitoria' },
  { estado: 'es', cidade: 'cachoeiro-de-itapemirim' },
  // BA
  { estado: 'ba', cidade: 'salvador' },
  { estado: 'ba', cidade: 'feira-de-santana' },
  { estado: 'ba', cidade: 'vitoria-da-conquista' },
  { estado: 'ba', cidade: 'camacari' },
  { estado: 'ba', cidade: 'juazeiro' },
  { estado: 'ba', cidade: 'itabuna' },
  { estado: 'ba', cidade: 'lauro-de-freitas' },
  // PE
  { estado: 'pe', cidade: 'recife' },
  { estado: 'pe', cidade: 'jaboatao-dos-guararapes' },
  { estado: 'pe', cidade: 'olinda' },
  { estado: 'pe', cidade: 'caruaru' },
  { estado: 'pe', cidade: 'petrolina' },
  { estado: 'pe', cidade: 'paulista' },
  // CE
  { estado: 'ce', cidade: 'fortaleza' },
  { estado: 'ce', cidade: 'caucaia' },
  { estado: 'ce', cidade: 'juazeiro-do-norte' },
  { estado: 'ce', cidade: 'maracanau' },
  { estado: 'ce', cidade: 'sobral' },
  // GO
  { estado: 'go', cidade: 'goiania' },
  { estado: 'go', cidade: 'aparecida-de-goiania' },
  { estado: 'go', cidade: 'anapolis' },
  { estado: 'go', cidade: 'rio-verde' },
  { estado: 'go', cidade: 'luziania' },
  // MT / MS / DF
  { estado: 'mt', cidade: 'cuiaba' },
  { estado: 'mt', cidade: 'varzea-grande' },
  { estado: 'mt', cidade: 'rondonopolis' },
  { estado: 'ms', cidade: 'campo-grande' },
  { estado: 'ms', cidade: 'dourados' },
  { estado: 'df', cidade: 'brasilia' }
];

const NICHES = [
  'dentistas', 
  'advogados', 
  'psicologas', 
  'nutricionistas',
  'arquitetos',
  'contadores',
  'medicos',
  'esteticistas',
  'corretores',
  'fisioterapeutas',
  'engenheiros',
  'personal-trainers'
];

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
}

generateSitemap();
