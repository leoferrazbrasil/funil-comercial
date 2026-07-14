import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The routes we specifically want to prerender (High Priority / Top of Funnel)
const CORE_ROUTES = [
  '/',
  '/cidades-atendidas',
  '/blog',
  '/blog/importancia-do-site-para-advogados',
  '/blog/como-captar-pacientes-odontologia',
  '/blog/google-ads-vs-meta-ads-negocios-locais'
];

async function prerender() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  // Make sure dist exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Please run "npm run build" first.');
    process.exit(1);
  }

  // 1. Start a local server serving the dist folder
  const app = express();
  
  // Serve static files
  app.use(express.static(distPath));
  
  // SPA fallback
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`🌍 Local server running at ${baseUrl} for prerendering...`);

    // 2. Launch Headless Browser
    console.log('🤖 Launching Puppeteer...');
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (launchError) {
      console.warn('⚠️ Puppeteer failed to launch. This is common on shared hosting environments missing Linux dependencies (e.g. libatk-bridge).');
      console.warn('⚠️ Skipping Selective Prerendering. The site will be deployed as a standard CSR SPA.');
      console.warn('⚠️ To fix this, deploy to a server with Chromium support (Vercel, Netlify, VPS) or build locally and upload the dist folder.');
      server.close();
      process.exit(0);
    }

    const page = await browser.newPage();
    
    // Optional: Intercept network requests to block analytics or heavy external scripts during prerender
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'media', 'font', 'websocket'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 3. Loop through core routes and take snapshots
    for (const route of CORE_ROUTES) {
      console.log(`\n⏳ Prerendering ${route} ...`);
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait an extra second just to be sure any React state (like helmet) is settled
        await new Promise(r => setTimeout(r, 1000));

        // Get the full HTML
        let html = await page.content();

        // Optional: We can inject a meta tag to indicate it was prerendered
        html = html.replace('<head>', '<head>\n    <meta name="prerendered" content="true">');

        // Determine save path
        const routePath = route === '/' ? '/index.html' : `${route}/index.html`;
        const absoluteSavePath = path.join(distPath, routePath);
        const dir = path.dirname(absoluteSavePath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(absoluteSavePath, html);
        console.log(`✅ Saved ${routePath}`);
      } catch (err) {
        console.error(`❌ Failed to prerender ${route}:`, err);
      }
    }

    // 4. Cleanup
    console.log('\n🧹 Cleaning up...');
    await browser.close();
    server.close();
    console.log('✨ Selective Prerendering Complete!');
    process.exit(0);
  });
}

prerender();
