/**
 * Minimal, read-only ZIP reader for the browser.
 *
 * It parses the archive's central directory and can inflate individual
 * entries using the platform's own `DecompressionStream`, so inspecting an
 * uploaded module package needs no third-party dependency. It reads; it never
 * writes anything to disk.
 */

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_HEADER_SIGNATURE = 0x02014b50
const LOCAL_HEADER_SIGNATURE = 0x04034b50
const EOCD_MIN_SIZE = 22
/** A trailing archive comment may be up to 64 KiB, and the EOCD sits before it. */
const EOCD_MAX_SEARCH = 0xffff + EOCD_MIN_SIZE

const METHOD_STORED = 0
const METHOD_DEFLATE = 8

const ZIP64_MARKER_32 = 0xffffffff
const ZIP64_MARKER_16 = 0xffff

export class ZipFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ZipFormatError'
  }
}

export interface ZipEntry {
  /** Entry name exactly as recorded in the archive. */
  name: string
  compressedSize: number
  uncompressedSize: number
  compressionMethod: number
  localHeaderOffset: number
  isDirectory: boolean
}

export interface ZipArchive {
  entries: ZipEntry[]
  /** Reads one entry's bytes, inflating it when necessary. */
  read(entry: ZipEntry): Promise<Uint8Array>
  /** Reads one entry and decodes it as UTF-8 text. */
  readText(entry: ZipEntry): Promise<string>
}

const findEndOfCentralDirectory = (view: DataView): number => {
  const start = Math.max(0, view.byteLength - EOCD_MAX_SEARCH)
  for (let offset = view.byteLength - EOCD_MIN_SIZE; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) return offset
  }
  throw new ZipFormatError(
    'Not a readable ZIP archive: the end-of-central-directory record is missing.',
  )
}

const inflateRaw = async (bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> => {
  if (typeof DecompressionStream === 'undefined') {
    throw new ZipFormatError(
      'This browser cannot inflate deflated archive entries (DecompressionStream is unavailable).',
    )
  }
  const decompressor = new DecompressionStream('deflate-raw')

  // Feed the compressed bytes in without awaiting first: the read loop below
  // drains the transform concurrently, which is what releases backpressure.
  const written = (async () => {
    const writer = decompressor.writable.getWriter()
    await writer.write(bytes)
    await writer.close()
  })()

  const reader = decompressor.readable.getReader()
  const parts: Uint8Array[] = []
  let total = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value)
    total += value.length
  }

  await written

  const inflated = new Uint8Array(total)
  let cursor = 0
  for (const part of parts) {
    inflated.set(part, cursor)
    cursor += part.length
  }
  return inflated
}

/**
 * Parses the central directory of a ZIP archive.
 *
 * @throws {ZipFormatError} when the bytes are not a ZIP, or use ZIP64, which
 * this reader deliberately does not support rather than guessing.
 */
export const readZipArchive = (buffer: ArrayBuffer): ZipArchive => {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const decoder = new TextDecoder('utf-8')

  const eocdOffset = findEndOfCentralDirectory(view)
  const totalEntries = view.getUint16(eocdOffset + 10, true)
  const centralDirOffset = view.getUint32(eocdOffset + 16, true)

  if (totalEntries === ZIP64_MARKER_16 || centralDirOffset === ZIP64_MARKER_32) {
    throw new ZipFormatError('ZIP64 archives are not supported by this inspector.')
  }
  if (centralDirOffset >= view.byteLength) {
    throw new ZipFormatError('Archive is truncated: the central directory is past end of file.')
  }

  const entries: ZipEntry[] = []
  let cursor = centralDirOffset

  for (let index = 0; index < totalEntries; index += 1) {
    if (cursor + 46 > view.byteLength) {
      throw new ZipFormatError('Archive is truncated: a central directory header is incomplete.')
    }
    if (view.getUint32(cursor, true) !== CENTRAL_HEADER_SIGNATURE) {
      throw new ZipFormatError(`Malformed central directory header at entry ${index + 1}.`)
    }

    const compressionMethod = view.getUint16(cursor + 10, true)
    const compressedSize = view.getUint32(cursor + 20, true)
    const uncompressedSize = view.getUint32(cursor + 24, true)
    const nameLength = view.getUint16(cursor + 28, true)
    const extraLength = view.getUint16(cursor + 30, true)
    const commentLength = view.getUint16(cursor + 32, true)
    const localHeaderOffset = view.getUint32(cursor + 42, true)

    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength))

    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      compressionMethod,
      localHeaderOffset,
      isDirectory: name.endsWith('/'),
    })

    cursor += 46 + nameLength + extraLength + commentLength
  }

  const read = async (entry: ZipEntry): Promise<Uint8Array> => {
    if (entry.isDirectory) return new Uint8Array(0)
    if (entry.compressedSize === ZIP64_MARKER_32 || entry.uncompressedSize === ZIP64_MARKER_32) {
      throw new ZipFormatError(`Entry "${entry.name}" uses ZIP64 sizes, which are not supported.`)
    }

    const headerOffset = entry.localHeaderOffset
    if (headerOffset + 30 > view.byteLength) {
      throw new ZipFormatError(`Entry "${entry.name}" points past the end of the archive.`)
    }
    if (view.getUint32(headerOffset, true) !== LOCAL_HEADER_SIGNATURE) {
      throw new ZipFormatError(`Entry "${entry.name}" has a malformed local file header.`)
    }

    const nameLength = view.getUint16(headerOffset + 26, true)
    const extraLength = view.getUint16(headerOffset + 28, true)
    const dataStart = headerOffset + 30 + nameLength + extraLength
    const dataEnd = dataStart + entry.compressedSize

    if (dataEnd > view.byteLength) {
      throw new ZipFormatError(`Entry "${entry.name}" is truncated.`)
    }

    const raw = bytes.subarray(dataStart, dataEnd)

    if (entry.compressionMethod === METHOD_STORED) return raw
    if (entry.compressionMethod === METHOD_DEFLATE) return inflateRaw(raw)

    throw new ZipFormatError(
      `Entry "${entry.name}" uses unsupported compression method ${entry.compressionMethod}.`,
    )
  }

  return {
    entries,
    read,
    readText: async (entry) => new TextDecoder('utf-8').decode(await read(entry)),
  }
}
