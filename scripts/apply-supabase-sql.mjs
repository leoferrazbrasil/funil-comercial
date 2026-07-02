import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import pg from 'pg'

const { Client } = pg

const projectRef = 'dtdtewojmyhiegwmgmte'
const migrationPath = resolve('supabase/migrations/20260702162000_initial_crm_foundation.sql')
const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error('Defina SUPABASE_DB_URL com a Database Connection String do projeto Supabase.')
}

if (!connectionString.includes(projectRef)) {
  throw new Error(
    `SUPABASE_DB_URL nao parece pertencer ao projeto ${projectRef}. Execucao bloqueada para evitar alterar outro banco.`,
  )
}

const sql = await readFile(migrationPath, 'utf8')
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

try {
  await client.query(sql)
  console.log(`Migracao aplicada com sucesso no projeto ${projectRef}.`)
} finally {
  await client.end()
}
