// Parser simples de CSV + extração de destinatários (nome/telefone) para o
// import de listas nas Campanhas. Sem dependência externa.

export type CsvRecipient = { nome: string; telefone: string };

const digits = (v: string) => (v ?? "").replace(/\D/g, "");

const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

// Detecta o separador olhando a 1ª linha, IGNORANDO trechos entre aspas (senão
// um nome como "Silva, Joao" contaminaria a contagem). BR costuma usar ";".
function detectSeparator(firstLine: string): "," | ";" | "\t" {
  const stripped = firstLine.replace(/"[^"]*"/g, "");
  const commas = (stripped.match(/,/g) || []).length;
  const semis = (stripped.match(/;/g) || []).length;
  const tabs = (stripped.match(/\t/g) || []).length;
  if (tabs > 0 && tabs >= commas && tabs >= semis) return "\t";
  return semis > commas ? ";" : ",";
}

// Parser de CSV (RFC 4180): aspas só ABREM no início do campo; "" = aspa literal.
export function parseCsv(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field.length === 0) {
      inQuotes = true;
    } else if (ch === sep) {
      pushField();
    } else if (ch === "\n") {
      pushField();
      pushRow();
    } else {
      // Aspa solta no meio do campo é tratada como caractere literal.
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

// Extrai destinatários válidos (telefone com >= 10 dígitos) do texto de um CSV.
export function extractCsvRecipients(text: string): {
  recipients: CsvRecipient[];
  invalid: number;
} {
  // Normaliza quebras de linha (\r\n e \r isolado → \n) e remove BOM.
  const norm = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const firstLine = norm.split("\n").find((l) => l.trim()) ?? "";
  const sep = detectSeparator(firstLine);
  const rows = parseCsv(norm, sep);
  if (rows.length === 0) return { recipients: [], invalid: 0 };

  const header = rows[0].map(normalize);
  const nomeIdx = header.findIndex((h) => /nome|name|contato|cliente|razao|empresa/.test(h));
  const telIdx = header.findIndex((h) =>
    /tel|phone|whats|celular|fone|numero|movel|mobile/.test(h),
  );
  const bothMapped = nomeIdx >= 0 && telIdx >= 0;

  // Cabeçalho detectado de forma independente do mapeamento: se a 1ª linha NÃO
  // tem nenhuma célula "com cara de telefone", é cabeçalho e é descartada
  // (evita contá-la como inválida quando só uma coluna foi reconhecida).
  const firstRowHasPhone = rows[0].some((c) => digits(c).length >= 10);
  const isHeaderRow = bothMapped || !firstRowHasPhone;
  const dataRows = isHeaderRow ? rows.slice(1) : rows;

  const recipients: CsvRecipient[] = [];
  let invalid = 0;

  for (const r of dataRows) {
    let nome = "";
    let tel = "";

    if (bothMapped) {
      nome = (r[nomeIdx] ?? "").trim();
      tel = (r[telIdx] ?? "").trim();
    } else {
      // Heurística: prefere a coluna com 10–13 dígitos (telefone típico); só
      // então qualquer coluna com >= 10 dígitos.
      let phoneCol = r.findIndex((c) => {
        const d = digits(c).length;
        return d >= 10 && d <= 13;
      });
      if (phoneCol < 0) phoneCol = r.findIndex((c) => digits(c).length >= 10);
      if (phoneCol >= 0) {
        tel = r[phoneCol].trim();
        const nameCol = r.findIndex((c, i) => i !== phoneCol && c.trim().length > 0);
        nome = nameCol >= 0 ? r[nameCol].trim() : "";
      }
    }

    if (digits(tel).length >= 10) {
      recipients.push({ nome: nome || "Contato", telefone: tel });
    } else {
      invalid += 1;
    }
  }

  return { recipients, invalid };
}
