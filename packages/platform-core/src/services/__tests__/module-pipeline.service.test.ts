import { describe, it, expect, beforeEach } from 'vitest'
import { deflateRawSync } from 'node:zlib'
import { ModulePipelineService, isEntryPathSafe } from '../module-pipeline.service'
import { readZipArchive, ZipFormatError } from '../../utils/zip-reader'
import { ModuleRegistry } from '../../assembly/ModuleRegistry'

/**
 * Builds a real ZIP archive in memory so the reader and the inspection
 * pipeline are exercised against actual archive bytes rather than a stub.
 */
const buildZip = (files: Record<string, string>, { deflate = false } = {}): ArrayBuffer => {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  const u16 = (view: DataView, at: number, value: number) => view.setUint16(at, value, true)
  const u32 = (view: DataView, at: number, value: number) => view.setUint32(at, value, true)

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name)
    const raw = encoder.encode(content)
    const data = deflate ? new Uint8Array(deflateRawSync(Buffer.from(raw))) : raw
    const method = deflate ? 8 : 0

    const local = new Uint8Array(30 + nameBytes.length + data.length)
    const localView = new DataView(local.buffer)
    u32(localView, 0, 0x04034b50)
    u16(localView, 4, 20)
    u16(localView, 8, method)
    u32(localView, 18, data.length)
    u32(localView, 22, raw.length)
    u16(localView, 26, nameBytes.length)
    local.set(nameBytes, 30)
    local.set(data, 30 + nameBytes.length)
    chunks.push(local)

    const header = new Uint8Array(46 + nameBytes.length)
    const headerView = new DataView(header.buffer)
    u32(headerView, 0, 0x02014b50)
    u16(headerView, 4, 20)
    u16(headerView, 6, 20)
    u16(headerView, 10, method)
    u32(headerView, 20, data.length)
    u32(headerView, 24, raw.length)
    u16(headerView, 28, nameBytes.length)
    u32(headerView, 42, offset)
    header.set(nameBytes, 46)
    central.push(header)

    offset += local.length
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0)
  const eocd = new Uint8Array(22)
  const eocdView = new DataView(eocd.buffer)
  u32(eocdView, 0, 0x06054b50)
  u16(eocdView, 8, central.length)
  u16(eocdView, 10, central.length)
  u32(eocdView, 12, centralSize)
  u32(eocdView, 16, offset)

  const total = [...chunks, ...central, eocd]
  const size = total.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let cursor = 0
  for (const part of total) {
    out.set(part, cursor)
    cursor += part.length
  }
  return out.buffer
}

const VALID_PACKAGE = {
  'analytics-widget/package.json': JSON.stringify({
    name: '@cap/module-analytics-widget',
    version: '1.2.0',
    description: 'Analytics widgets',
  }),
  'analytics-widget/src/index.ts': 'export const AnalyticsWidgetModule = {}',
  'analytics-widget/src/index.test.ts': 'it("works", () => {})',
  'analytics-widget/data/dictionaries/en.json': '{}',
}

describe('zip-reader', () => {
  it('reads stored entries out of a real archive', async () => {
    const archive = readZipArchive(buildZip({ 'a.txt': 'hello', 'b/c.txt': 'world' }))
    expect(archive.entries.map((e) => e.name)).toEqual(['a.txt', 'b/c.txt'])
    expect(await archive.readText(archive.entries[0])).toBe('hello')
  })

  it('inflates deflated entries', async () => {
    const payload = 'x'.repeat(2000)
    const archive = readZipArchive(buildZip({ 'big.txt': payload }, { deflate: true }))
    expect(archive.entries[0].compressionMethod).toBe(8)
    expect(await archive.readText(archive.entries[0])).toBe(payload)
  })

  it('rejects bytes that are not a ZIP archive', () => {
    const notAZip = new TextEncoder().encode('this is plainly not a zip file at all').buffer
    expect(() => readZipArchive(notAZip)).toThrow(ZipFormatError)
  })
})

describe('isEntryPathSafe', () => {
  it('accepts ordinary relative entry names', () => {
    expect(isEntryPathSafe('src/index.ts')).toBe(true)
    expect(isEntryPathSafe('a/b/c.json')).toBe(true)
  })

  it('rejects traversal, absolute, drive-letter and backslash names', () => {
    expect(isEntryPathSafe('../../etc/passwd')).toBe(false)
    expect(isEntryPathSafe('src/../../escape.ts')).toBe(false)
    expect(isEntryPathSafe('/etc/passwd')).toBe(false)
    expect(isEntryPathSafe('C:/windows/system32')).toBe(false)
    expect(isEntryPathSafe('src\\..\\..\\escape.ts')).toBe(false)
  })
})

describe('ModulePipelineService', () => {
  let service: ModulePipelineService

  beforeEach(() => {
    service = new ModulePipelineService()
    ModuleRegistry.getInstance().reset()
  })

  it('initializes a job with the three inspection stages', () => {
    const job = service.createJob('test-module.zip', 2048)
    expect(job.jobId).toBeDefined()
    expect(job.currentStage).toBe('READING')
    expect(job.stages.map((s) => s.stage)).toEqual(['READING', 'INSPECTING', 'VALIDATING'])
  })

  it('validates a well-formed package and reports real archive facts', async () => {
    const job = service.createJob('analytics-widget.zip', 1024)
    const result = await service.inspectArchive(job.jobId, buildZip(VALID_PACKAGE))

    expect(result.currentStage).toBe('COMPLETE')
    expect(result.error).toBeUndefined()
    expect(result.moduleId).toBe('analytics-widget')
    expect(result.version).toBe('1.2.0')
    expect(result.entryCount).toBe(4)
    expect(result.uncompressedBytes).toBeGreaterThan(0)
    expect(result.validation?.valid).toBe(true)
  })

  it('fails a package with no entry point', async () => {
    const job = service.createJob('broken.zip', 512)
    const result = await service.inspectArchive(
      job.jobId,
      buildZip({
        'broken/package.json': JSON.stringify({ name: 'broken', version: '1.0.0' }),
        'broken/readme.md': '# nothing here',
      }),
    )

    expect(result.currentStage).toBe('FAILED')
    expect(result.validation?.valid).toBe(false)
    expect(result.validation?.errors.join(' ')).toMatch(/entry point/i)
  })

  it('fails a package whose manifest is missing', async () => {
    const job = service.createJob('nomanifest.zip', 512)
    const result = await service.inspectArchive(
      job.jobId,
      buildZip({ 'src/index.ts': 'export default {}' }),
    )

    expect(result.currentStage).toBe('FAILED')
    expect(result.validation?.errors.join(' ')).toMatch(/module.manifest.json/)
  })

  it('rejects an archive carrying a Zip Slip entry', async () => {
    const job = service.createJob('evil.zip', 512)
    const result = await service.inspectArchive(
      job.jobId,
      buildZip({
        '../../../evil.sh': 'rm -rf /',
        'package.json': JSON.stringify({ name: 'evil', version: '1.0.0' }),
      }),
    )

    expect(result.currentStage).toBe('FAILED')
    expect(result.error).toMatch(/Zip Slip/i)
  })

  it('rejects an id that is already registered in the shell', async () => {
    ModuleRegistry.getInstance().registerModule({ id: 'analytics-widget', version: '0.9.0' })

    const job = service.createJob('analytics-widget.zip', 1024)
    const result = await service.inspectArchive(job.jobId, buildZip(VALID_PACKAGE))

    expect(result.currentStage).toBe('FAILED')
    expect(result.validation?.errors.join(' ')).toMatch(/already registered/i)
  })

  it('rejects an invalid module id', async () => {
    const job = service.createJob('bad-id.zip', 512)
    const result = await service.inspectArchive(
      job.jobId,
      buildZip({
        'package.json': JSON.stringify({ name: 'INVALID ID!', version: '1.0.0' }),
        'src/index.ts': 'export default {}',
      }),
    )

    expect(result.currentStage).toBe('FAILED')
    expect(result.validation?.errors.join(' ')).toMatch(/Invalid module id/)
  })

  it('warns, but does not fail, on soft contract gaps', async () => {
    const job = service.createJob('minimal.zip', 512)
    const result = await service.inspectArchive(
      job.jobId,
      buildZip({
        'package.json': JSON.stringify({ name: 'minimal', version: '1.0.0' }),
        'src/index.ts': 'export default {}',
      }),
    )

    expect(result.currentStage).toBe('COMPLETE')
    const warnings = result.validation?.warnings.join(' ') ?? ''
    expect(warnings).toMatch(/description/i)
    expect(warnings).toMatch(/i18n/i)
    expect(warnings).toMatch(/test files/i)
  })
})
