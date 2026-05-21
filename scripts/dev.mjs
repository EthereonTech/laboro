#!/usr/bin/env node
/**
 * Ambiente de desenvolvimento — um comando só.
 * Uso: npm run dev          → deps + API (porta 3000)
 *      npm run dev:all      → deps + API + web (porta 3001)
 *      npm run dev:deps     → só Postgres + Redis + migrations
 */
import { spawn, execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, 'apps', 'api')
const args = process.argv.slice(2)
const depsOnly = args.includes('--deps-only')
const withWeb = args.includes('--all')

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit', shell: true })
}

async function waitForDocker() {
  const checks = [
    () => run('docker exec laboro_postgres pg_isready -U laboro', root),
    () => run('docker exec laboro_redis redis-cli ping', root),
  ]
  for (let i = 0; i < 40; i++) {
    try {
      for (const c of checks) c()
      return
    } catch {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw new Error('Postgres/Redis não ficaram prontos. Rode: docker compose up -d')
}

function startWorkspace(workspace) {
  return spawn('npm', ['run', 'dev', `--workspace=${workspace}`], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
}

console.log('\n[laboro] Subindo Postgres + Redis...\n')
run('docker compose up -d')

console.log('\n[laboro] Aguardando banco e cache...\n')
await waitForDocker()

console.log('\n[laboro] Migrations Prisma...\n')
run('npx prisma migrate deploy', apiDir)
// generate só após npm install ou mudança no schema (evita EPERM no Windows com API rodando)
if (args.includes('--generate')) {
  console.log('\n[laboro] Prisma generate...\n')
  run('npx prisma generate', apiDir)
}

if (depsOnly) {
  console.log('\n[laboro] Pronto. API: npm run dev:api | Web: npm run dev:web\n')
  process.exit(0)
}

console.log('\n[laboro] Iniciando serviços (Ctrl+C para parar)...\n')
console.log('  API:  http://localhost:3000  (docs: /docs, health: /health)')
if (withWeb) console.log('  Web:  http://localhost:3001\n')

const children = [startWorkspace('apps/api')]
if (withWeb) children.push(startWorkspace('apps/web'))

let stopping = false
const stopAll = (code = 0) => {
  if (stopping) return
  stopping = true
  for (const c of children) {
    if (!c.killed) c.kill()
  }
  process.exit(code)
}

for (const c of children) c.on('exit', (code) => stopAll(code ?? 0))
process.on('SIGINT', () => stopAll(0))
