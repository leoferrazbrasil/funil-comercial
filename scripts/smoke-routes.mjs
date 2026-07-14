import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = Number(process.env.FUNIL_PREVIEW_PORT ?? 4174);
const baseUrl = `http://${host}:${port}`;
const routes = [
  "/",
  "/site-para-negocios-locais",
  "/diagnostico-estrutura-de-vendas",
  "/google-meu-negocio",
  "/trafego-pago-negocios-locais",
  "/crm-whatsapp-organizado",
  "/site-para-dentistas",
  "/site-para-nutricionistas",
  "/site-para-psicologas",
  "/login",
  "/dashboard",
  "/inbox",
  "/contatos",
  "/leads",
  "/funil",
];
const distIndex = join(process.cwd(), "dist", "index.html");
const viteBin = join(process.cwd(), "node_modules", "vite", "bin", "vite.js");

if (!existsSync(distIndex)) {
  throw new Error("dist/index.html nao encontrado. Rode npm run build antes do smoke test.");
}

if (!existsSync(viteBin)) {
  throw new Error("Vite nao encontrado em node_modules. Rode npm install ou npm ci.");
}

const preview = spawn(
  process.execPath,
  [viteBin, "preview", "--host", host, "--port", String(port), "--strictPort"],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

let previewOutput = "";
preview.stdout.on("data", (chunk) => {
  previewOutput += chunk.toString();
});
preview.stderr.on("data", (chunk) => {
  previewOutput += chunk.toString();
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPreview() {
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`Preview encerrou antes de responder.\n${previewOutput}`);
    }

    try {
      const response = await fetch(`${baseUrl}/`, {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) return;
    } catch {
      // Keep waiting until Vite opens the preview port.
    }

    await wait(250);
  }

  throw new Error(`Timeout aguardando preview em ${baseUrl}.\n${previewOutput}`);
}

async function assertRoute(route) {
  const response = await fetch(`${baseUrl}${route}`, {
    signal: AbortSignal.timeout(5000),
  });
  const body = await response.text();

  if (response.status !== 200) {
    throw new Error(`${route} retornou HTTP ${response.status}.`);
  }

  if (!body.includes("Funil Comercial") || !body.includes('id="root"')) {
    throw new Error(`${route} nao retornou o HTML base da SPA.`);
  }

  console.log(`ok - ${route}`);
}

try {
  await waitForPreview();

  for (const route of routes) {
    await assertRoute(route);
  }

  console.log(`Smoke test de rotas concluido em ${baseUrl}.`);
} finally {
  if (preview.exitCode === null) {
    preview.kill();
  }
}
