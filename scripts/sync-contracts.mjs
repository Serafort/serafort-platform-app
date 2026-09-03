#!/usr/bin/env node
/**
 * Shared Contract Synchronization Script
 * Synchronizes DTOs from AdonisJS backend (`Authentication/app/contracts/dtos`)
 * to `@cap/api-contracts/src/dtos` and updates barrel exports.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const BACKEND_DTO_DIR = path.resolve(ROOT_DIR, 'Authentication/app/contracts/dtos')
const FRONTEND_DTO_DIR = path.resolve(ROOT_DIR, 'boilerplate/packages/api-contracts/src/dtos')

console.log(`[sync-contracts] Reading backend DTOs from: ${BACKEND_DTO_DIR}`)
console.log(`[sync-contracts] Writing frontend DTOs to: ${FRONTEND_DTO_DIR}`)

if (!fs.existsSync(BACKEND_DTO_DIR)) {
  console.error(`[sync-contracts] Backend DTO directory not found: ${BACKEND_DTO_DIR}`)
  process.exit(1)
}

if (!fs.existsSync(FRONTEND_DTO_DIR)) {
  fs.mkdirSync(FRONTEND_DTO_DIR, { recursive: true })
}

const files = fs.readdirSync(BACKEND_DTO_DIR).filter(f => f.endsWith('.ts'))
const exportedModules = []

for (const file of files) {
  const sourcePath = path.join(BACKEND_DTO_DIR, file)
  const targetPath = path.join(FRONTEND_DTO_DIR, file)
  
  let content = fs.readFileSync(sourcePath, 'utf8')
  
  // Add header banner
  const header = `/**\n * Auto-generated / synchronized from Authentication backend.\n * Source: Authentication/app/contracts/dtos/${file}\n * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs\n */\n\n`
  
  fs.writeFileSync(targetPath, header + content, 'utf8')
  console.log(`[sync-contracts] Synchronized: ${file}`)
  
  const baseName = file.replace(/\.ts$/, '')
  exportedModules.push(baseName)
}

// Generate dtos/index.ts
const indexContent = `/**\n * Centralized DTO Exports for @cap/api-contracts\n */\n\n` +
  exportedModules.map(mod => `export * from './${mod}'`).join('\n') + '\n'

fs.writeFileSync(path.join(FRONTEND_DTO_DIR, 'index.ts'), indexContent, 'utf8')
console.log(`[sync-contracts] Generated dtos/index.ts with ${exportedModules.length} modules.`)
