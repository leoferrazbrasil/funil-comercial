import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import pg from 'pg'

const { Client } = pg

const projectRef = 'dtdtewojmyhiegwmgmte'
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

try {
  for (const migrationFile of migrationFiles) {
    const sql = await readFile(resolve(migrationsDir, migrationFile), 'utf8')
    await client.query(sql)
    console.log(`Migration aplicada: ${migrationFile}`)
  }
  console.log(`Migrations aplicadas com sucesso no projeto ${projectRef}.`)
} finally {
  await client.end()
}
