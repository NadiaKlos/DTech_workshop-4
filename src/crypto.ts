import { webcrypto } from "crypto";
import * as crypto from "crypto";


// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keyPair = await webcrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" },
      },
      true,
      ["encrypt", "decrypt"]
  );
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exportedKey = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exportedKey);
}
export interface CryptoKey {

}
// Export a crypto private key to a base64 string format
export async function exportPrvKey(
    key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (!key) return null;
  const exportedKey = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exportedKey);
}

// Import a base64 string public key to its native format
export async function importPubKey(
    strKey: string
): Promise<webcrypto.CryptoKey> {
  const binaryKey = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "spki",
      binaryKey,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
      },
      true,
      ["encrypt"]
  );
}

// Import a base64 string private key to its native format
export async function importPrvKey(
    strKey: string
): Promise<webcrypto.CryptoKey> {
  const binaryKey = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
      },
      true,
      ["decrypt"]
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
    b64Data: string,
    strPublicKey: string
): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const dataBuffer = base64ToArrayBuffer(b64Data);
  const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataBuffer
  );
  return arrayBufferToBase64(encryptedData);
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
    data: string,
    privateKey: webcrypto.CryptoKey
): Promise<string> {
  const encryptedData = base64ToArrayBuffer(data);
  const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedData
  );
  return arrayBufferToBase64(decryptedData);
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
  );
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const exportedKey = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exportedKey);
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
    strKey: string
): Promise<webcrypto.CryptoKey> {
  const binaryKey = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "raw",
      binaryKey,
      { name: "AES-CBC" },
      true,
      ["encrypt", "decrypt"]
  );
}

/// Encrypt a message using a symmetric key
export async function symEncrypt(
    key: webcrypto.CryptoKey,
    data: string
): Promise<string> {
  const dataBuffer = new TextEncoder().encode(data);
  const iv = crypto.randomBytes(16); // Initialization vector
  const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      dataBuffer
  );
  const encryptedArray = new Uint8Array(encryptedData);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv);
  result.set(encryptedArray, iv.length);
  return arrayBufferToBase64(result.buffer);
}


// Decrypt a message using a symmetric key
export async function symDecrypt(
    strKey: string,
    encryptedData: string
): Promise<string> {
  const key = await importSymKey(strKey);
  const dataWithIV = base64ToArrayBuffer(encryptedData);
  const iv = dataWithIV.slice(0, 16);
  const dataWithoutIV = dataWithIV.slice(16);
  const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      dataWithoutIV
  );
  return new TextDecoder().decode(decryptedData)
}
