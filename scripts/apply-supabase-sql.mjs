import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import pg from 'pg'

const { Client } = pg

// Projeto atual (linkado): Funil Comercial Produção.
const projectRef = 'juvwfxnlusrnvcarkrmc'
const migrationsDir = resolve('supabase/migrations')
const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error('Defina SUPABASE_DB_URL com a Database Connection String do projeto Supabase.')
}

if (!connectionString.includes(projectRef)) {
  throw new Error(
    `SUPABASE_DB_URL nao parece pertencer ao projeto ${projectRef}. Execucao bloqueada para evitar alterar outro banco.`,
  )
}

// Erros benignos ao REaplicar migrações num banco que já tem parte do schema.
// Este script nao mantem historico de migrations, entao reaplica todos os
// arquivos; toleramos "ja existe / ja e membro" para poder rodar de novo com
// seguranca (ex.: a migration de realtime faz ALTER PUBLICATION ADD TABLE).
const BENIGN_ERROR_CODES = new Set([
  '42710', // duplicate_object (ex.: objeto ja existe / ja e membro da publication)
  '42P07', // duplicate_table
  '42701', // duplicate_column
  '42P06', // duplicate_schema
  '42723', // duplicate_function
  '42P16', // invalid_table_definition (ex.: replica identity ja definida em alguns casos)
  '23505', // unique_violation (linha de seed ja inserida)
])

const isBenign = (error) =>
  BENIGN_ERROR_CODES.has(error?.code) ||
  /already exists|already a member|already member|duplicate/i.test(error?.message ?? '')

const migrationFiles = (await readdir(migrationsDir))
  .filter((file) => file.endsWith('.sql'))
  .sort()

if (migrationFiles.length === 0) {
  throw new Error('Nenhuma migration SQL encontrada em supabase/migrations.')
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

let applied = 0
let skipped = 0

try {
  for (const migrationFile of migrationFiles) {
    const sql = await readFile(resolve(migrationsDir, migrationFile), 'utf8')
    try {
      await client.query(sql)
      applied += 1
      console.log(`✅ Migration aplicada: ${migrationFile}`)
    } catch (error) {
      if (isBenign(error)) {
        skipped += 1
        console.log(`⏭️  Migration ignorada (ja aplicada): ${migrationFile} — ${error.code ?? ''} ${error.message}`)
      } else {
        console.error(`❌ Falha em ${migrationFile}: ${error.code ?? ''} ${error.message}`)
        throw error
      }
    }
  }
  console.log(`\nConcluido no projeto ${projectRef}: ${applied} aplicada(s), ${skipped} ignorada(s).`)
} finally {
  await client.end()
}
