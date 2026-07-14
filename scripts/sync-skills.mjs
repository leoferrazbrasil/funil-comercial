// sync-skills — mantém as skills disponíveis em QUALQUER IDE/agente do projeto.
//
// Fonte canônica: .agents/skills  (lida por Antigravity, OpenAI Codex e, via
// settings, VS Code Copilot). Espelha para .claude/skills, que é a ÚNICA pasta
// que o Claude Code (CLI + extensão VSCode) lê.
//
// Fluxo: edite/adicione skills em .agents/skills e rode `npm run sync-skills`.
//
// Windows-friendly (cópia, não symlink — symlink exige Modo Desenvolvedor/admin
// e quebra fácil no git).

import { cpSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, ".agents", "skills");
const DEST = join(root, ".claude", "skills");

if (!existsSync(SRC)) {
  console.error(`[sync-skills] fonte não encontrada: ${SRC}`);
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });

const skills = readdirSync(SRC).filter((name) =>
  statSync(join(SRC, name)).isDirectory(),
);

for (const skill of skills) {
  cpSync(join(SRC, skill), join(DEST, skill), { recursive: true, force: true });
}

console.log(
  `[sync-skills] ${skills.length} skills espelhadas: .agents/skills -> .claude/skills`,
);
