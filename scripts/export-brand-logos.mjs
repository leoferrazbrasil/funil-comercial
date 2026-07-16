import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const outDir = path.resolve("public/brand/logos");

const COLORS = {
  primary: "#F59E0B",
  dark: "#09090B",
  white: "#FFFFFF",
  black: "#000000",
};

const FONT_STACK = "Outfit, Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";

const THEMES = {
  default: {
    icon: COLORS.primary,
    text: COLORS.white,
  },
  black: {
    icon: COLORS.black,
    text: COLORS.black,
  },
};

function iconSvg(theme = "default", iconSize = 64) {
  const color = THEMES[theme].icon;
  return `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="min-width:${iconSize}px;flex-shrink:0;display:block">
    <rect x="4" y="6" width="40" height="10" rx="4" fill="${color}" opacity="0.3"/>
    <rect x="12" y="20" width="24" height="10" rx="4" fill="${color}" opacity="0.6"/>
    <rect x="20" y="34" width="8" height="10" rx="4" fill="${color}"/>
  </svg>`;
}

function logoHtml({ theme = "default", iconSize = 64 }) {
  const textSize = iconSize * 0.65;
  const lineHeight = iconSize * 0.7;
  const gap = iconSize * 0.4;
  const textColor = THEMES[theme].text;

  return `<div class="logo" style="display:inline-flex;align-items:center;gap:${gap}px;color:${textColor};font-family:${FONT_STACK};font-synthesis:none;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;">
    ${iconSvg(theme, iconSize)}
    <div style="display:flex;font-size:${textSize}px;line-height:${lineHeight}px;gap:0.25em;letter-spacing:-0.025em;color:${textColor};">
      <span style="font-weight:700;">Funil</span>
      <span style="font-weight:300;opacity:0.9;">Comercial</span>
    </div>
  </div>`;
}

function horizontalSvg({ theme = "default", background = "transparent", label }) {
  const iconSize = 64;
  const textSize = iconSize * 0.65;
  const lineHeight = iconSize * 0.7;
  const gap = iconSize * 0.4;
  const wordGap = textSize * 0.25;
  const textX = iconSize + gap;
  const textY = 46;
  const width = 390;
  const height = 64;
  const textColor = THEMES[theme].text;
  const iconColor = THEMES[theme].icon;
  const bg = background === "transparent" ? "" : `  <rect width="${width}" height="${height}" fill="${background}"/>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funil Comercial - ${label}">
  <title>Funil Comercial - ${label}</title>
${bg}  <g transform="scale(${iconSize / 48})">
    <rect x="4" y="6" width="40" height="10" rx="4" fill="${iconColor}" opacity="0.3"/>
    <rect x="12" y="20" width="24" height="10" rx="4" fill="${iconColor}" opacity="0.6"/>
    <rect x="20" y="34" width="8" height="10" rx="4" fill="${iconColor}"/>
  </g>
  <text x="${textX}" y="${textY}" fill="${textColor}" font-family="${FONT_STACK}" font-size="${textSize}" letter-spacing="-0.025em">
    <tspan font-weight="700">Funil</tspan>
    <tspan dx="${wordGap}" font-weight="300" opacity="0.9">Comercial</tspan>
  </text>
</svg>`;
}

function symbolSvg({ theme = "default", background = "transparent", label }) {
  const color = THEMES[theme].icon;
  const bg = background === "transparent" ? "" : `  <rect width="48" height="48" fill="${background}"/>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funil Comercial - ${label}">
  <title>Funil Comercial - ${label}</title>
${bg}  <rect x="4" y="6" width="40" height="10" rx="4" fill="${color}" opacity="0.3"/>
  <rect x="12" y="20" width="24" height="10" rx="4" fill="${color}" opacity="0.6"/>
  <rect x="20" y="34" width="8" height="10" rx="4" fill="${color}"/>
</svg>`;
}

const assets = [
  {
    name: "funil-comercial-logo-horizontal-principal",
    type: "horizontal",
    theme: "default",
    svg: horizontalSvg({ theme: "default", label: "Principal" }),
  },
  {
    name: "funil-comercial-logo-horizontal-fundo-claro",
    type: "horizontal",
    theme: "black",
    svg: horizontalSvg({ theme: "black", label: "Fundo claro" }),
  },
  {
    name: "funil-comercial-logo-horizontal-transparente",
    type: "horizontal",
    theme: "default",
    svg: horizontalSvg({ theme: "default", label: "Horizontal transparente" }),
  },
  {
    name: "funil-comercial-logo-horizontal-fundo-preto",
    type: "horizontal",
    theme: "default",
    background: COLORS.dark,
    svg: horizontalSvg({ theme: "default", background: COLORS.dark, label: "Horizontal fundo preto" }),
  },
  {
    name: "funil-comercial-logo-horizontal-fundo-branco",
    type: "horizontal",
    theme: "black",
    background: COLORS.white,
    svg: horizontalSvg({ theme: "black", background: COLORS.white, label: "Horizontal fundo branco" }),
  },
  {
    name: "funil-comercial-simbolo-principal",
    type: "symbol",
    theme: "default",
    svg: symbolSvg({ theme: "default", label: "Simbolo principal" }),
  },
  {
    name: "funil-comercial-simbolo-fundo-claro",
    type: "symbol",
    theme: "black",
    svg: symbolSvg({ theme: "black", label: "Simbolo fundo claro" }),
  },
  {
    name: "funil-comercial-simbolo-transparente",
    type: "symbol",
    theme: "default",
    svg: symbolSvg({ theme: "default", label: "Simbolo transparente" }),
  },
  {
    name: "funil-comercial-simbolo-fundo-preto",
    type: "symbol",
    theme: "default",
    background: COLORS.dark,
    svg: symbolSvg({ theme: "default", background: COLORS.dark, label: "Simbolo fundo preto" }),
  },
  {
    name: "funil-comercial-simbolo-fundo-branco",
    type: "symbol",
    theme: "black",
    background: COLORS.white,
    svg: symbolSvg({ theme: "black", background: COLORS.white, label: "Simbolo fundo branco" }),
  },
];

const fontLinks = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;

async function renderHorizontalPng(browser, asset, outputPath, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: 2200, height: 600, deviceScaleFactor: scale });
  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        ${fontLinks}
        <style>
          html, body { margin: 0; background: transparent; }
          body { width: 2200px; height: 600px; display: flex; align-items: flex-start; justify-content: flex-start; overflow: hidden; }
          #stage { display: inline-flex; background: ${asset.background ?? "transparent"}; }
        </style>
      </head>
      <body>
        <div id="stage">${logoHtml({ theme: asset.theme, iconSize: 64 })}</div>
      </body>
    </html>`,
    { waitUntil: "networkidle0" },
  );
  await page.evaluate(() => document.fonts?.ready);
  const stage = await page.$("#stage");
  await stage.screenshot({ path: outputPath, omitBackground: !asset.background });
  await page.close();
}

async function renderSymbolPng(browser, asset, outputPath, size) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <style>
          html, body { margin: 0; width: ${size}px; height: ${size}px; background: ${asset.background ?? "transparent"}; }
          body { display: grid; place-items: center; overflow: hidden; }
          svg { width: ${Math.round(size * 0.72)}px; height: ${Math.round(size * 0.72)}px; display: block; }
        </style>
      </head>
      <body>${iconSvg(asset.theme, Math.round(size * 0.72))}</body>
    </html>`,
    { waitUntil: "domcontentloaded" },
  );
  await page.screenshot({ path: outputPath, omitBackground: !asset.background });
  await page.close();
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    for (const asset of assets) {
      await fs.writeFile(path.join(outDir, `${asset.name}.svg`), asset.svg, "utf8");

      if (asset.type === "horizontal") {
        await renderHorizontalPng(browser, asset, path.join(outDir, `${asset.name}-low.png`), 1);
        await renderHorizontalPng(browser, asset, path.join(outDir, `${asset.name}-high.png`), 4);
      } else {
        await renderSymbolPng(browser, asset, path.join(outDir, `${asset.name}-low.png`), 128);
        await renderSymbolPng(browser, asset, path.join(outDir, `${asset.name}-high.png`), 512);
      }
    }

    const readme = `# Logos Funil Comercial

Exports aprovados a partir da secao "Sistema de Logo" do brandbook.

Os PNGs horizontais sao renderizados com a mesma geometria do componente oficial \`src/components/Logo.tsx\`:
- iconSize: 64
- gap entre simbolo e texto: iconSize * 0.4
- texto: Outfit/Inter, pesos 700 e 300, herdando a mesma importacao de fontes do app

Versoes:
- \`*-principal.svg/png\`: uso preferencial em fundos escuros.
- \`*-fundo-claro.svg/png\`: uso monocromatico em fundos claros.
- \`*-transparente.svg/png\`: fundo transparente para sobrepor em layouts escuros.
- \`*-fundo-preto.svg/png\`: arquivo fechado em fundo escuro oficial #09090B.
- \`*-fundo-branco.svg/png\`: arquivo fechado em fundo branco.
- \`*-low.png\`: baixa resolucao para interface web compacta.
- \`*-high.png\`: alta resolucao para telas retina, previews e materiais digitais.
`;
    await fs.writeFile(path.join(outDir, "README.md"), readme, "utf8");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
