/**
 * Secure Encryption Utility Proxy
 * Offloads heavy PBKDF2 operations and data serialization to a Dedicated Web Worker in browsers,
 * with seamless fallback to direct WebCrypto execution in environments without Web Worker support (e.g. tests).
 */
import * as comlink from 'comlink'
import type { EncryptionService } from './encryption.worker'
import * as inlineWorker from './encryption.worker'

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export function generateEncryptionPassword(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  }
  return bytesToHex(array)
}

export function isWebCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.encrypt === 'function'
  )
}

let workerProxy: comlink.Remote<EncryptionService> | null = null

function getWorkerProxy(): comlink.Remote<EncryptionService> | null {
  if (typeof Worker === 'undefined') {
    return null
  }
  if (!workerProxy) {
    try {
      const worker = new Worker(new URL('./encryption.worker.ts', import.meta.url), {
        type: 'module',
      })
      workerProxy = comlink.wrap<EncryptionService>(worker)
    } catch {
      workerProxy = null
    }
  }
  return workerProxy
}

export async function hashData(data: string): Promise<string> {
  const proxy = getWorkerProxy()
  if (proxy) {
    return proxy.hashData(data)
  }
  return inlineWorker.hashData(data)
}

export async function encryptData(data: string, password: string): Promise<string> {
  const proxy = getWorkerProxy()
  if (proxy) {
    return proxy.encryptData(data, password)
  }
  return inlineWorker.encryptData(data, password)
}

export async function decryptData(encryptedDataHex: string, password: string): Promise<string> {
  const proxy = getWorkerProxy()
  if (proxy) {
    return proxy.decryptData(encryptedDataHex, password)
  }
  return inlineWorker.decryptData(encryptedDataHex, password)
}

export default {
  encryptData,
  decryptData,
  hashData,
  generateEncryptionPassword,
  isWebCryptoAvailable,
  bytesToHex,
  hexToBytes,
}
