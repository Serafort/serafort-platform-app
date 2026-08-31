/// <reference lib="webworker" />
import * as comlink from "comlink";

/**
 * Secure Encryption Utility Worker using Web Crypto API
 * Moved to a Web Worker to prevent UI blocking during massive PBKDF2 iterations
 * and large string serialization.
 */

const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer as any);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export async function encryptData(
  data: string,
  password: string,
): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer as any,
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(
      salt.length + iv.length + encryptedArray.length,
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);

    return bytesToHex(combined);
  } catch (error) {
    console.error("Encryption worker error:", error);
    throw new Error("Failed to encrypt data");
  }
}

export async function decryptData(
  encryptedDataHex: string,
  password: string,
): Promise<string> {
  try {
    const combined = hexToBytes(encryptedDataHex);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 16 + IV_LENGTH);
    const encryptedBuffer = combined.slice(16 + IV_LENGTH);

    const key = await deriveKey(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      encryptedBuffer as any,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption worker error:", error);
    throw new Error("Failed to decrypt data");
  }
}

export function generateEncryptionPassword(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bytesToHex(array);
}

export function isWebCryptoAvailable(): boolean {
  return (
    typeof crypto !== "undefined" &&
    crypto.subtle &&
    typeof crypto.subtle.encrypt === "function"
  );
}

const encryptionService = {
  encryptData,
  decryptData,
  hashData,
  generateEncryptionPassword,
  isWebCryptoAvailable,
  bytesToHex,
  hexToBytes,
};

export type EncryptionService = typeof encryptionService;

if (
  typeof self !== "undefined" &&
  typeof (self as any).addEventListener === "function"
) {
  try {
    comlink.expose(encryptionService);
  } catch {
    // Environment does not support message ports (e.g. Node/test)
  }
}
