import { secp256k1 } from '@noble/curves/secp256k1.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { ctr } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/hashes/utils.js';


/**
 * TODO: in src/ciphers/crypto/encrypt we have partial of this logic below. 
 * However, Chainlink uses EthCrypt that uses bcrypt and other package
 * So we have implemented here the same logic but using noble packages, however, work on refactoring can be done to streamline the code and logic
 * Between all those different components. 
 * 
 * Reference: 
 * - https://github.com/pubkey/eth-crypto/blob/master/src/public-key-by-private-key.js
 * - https://github.com/smartcontractkit/functions-toolkit/blob/0d918da87eafe0c26b34c2e04eaacf9c960827a1/src/SecretsManager.ts#L20
 */


/**
 * Decompresses a compressed secp256k1 public key
 * @param {string|Uint8Array} compressedKey - The compressed public key
 * @returns {Uint8Array} The uncompressed public key (65 bytes)
 */
function decompressPublicKey(compressedKey) {
    let keyBytes;
    if (typeof compressedKey === 'string') {
        keyBytes = new Uint8Array(compressedKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    } else {
        keyBytes = compressedKey;
    }

    // If already uncompressed (65 bytes with 04 prefix), return as-is
    if (keyBytes.length === 65 && keyBytes[0] === 0x04) {
        return keyBytes;
    }

    // If uncompressed without prefix (64 bytes), add the 04 prefix
    if (keyBytes.length === 64) {
        return new Uint8Array([0x04, ...keyBytes]);
    }

    // If compressed (33 bytes), decompress
    if (keyBytes.length === 33) {
        const uncompressed = secp256k1.getPublicKey(keyBytes.slice(1), keyBytes[0] === 0x03);
        return new Uint8Array([0x04, ...uncompressed]);
    }

    throw new Error(`Invalid public key format: expected 33, 64, or 65 bytes, got ${keyBytes.length} bytes`);
}

/**
 * Encrypts a message using ECIES with secp256k1
 * Compatible with eth-crypto's encryptWithPublicKey API
 * @param {string|Uint8Array} publicKey - The recipient's public key
 * @param {string} message - The message to encrypt
 * @param {object} opts - Optional parameters
 * @returns {Promise<{iv: string, ephemPublicKey: string, ciphertext: string, mac: string}>}
 */
export async function encryptWithPublicKey(publicKey, message, opts = {}) {
    // Decompress the public key
    const uncompressedKey = decompressPublicKey(publicKey);

    // Generate ephemeral key pair
    const ephemeralPrivateKey = secp256k1.utils.randomSecretKey();
    const ephemeralPublicKey = secp256k1.getPublicKey(ephemeralPrivateKey);

    // Perform ECDH to get shared secret
    const sharedSecret = secp256k1.getSharedSecret(ephemeralPrivateKey, uncompressedKey);

    // Use HKDF to derive encryption key and MAC key
    const derivedKeys = hkdf(sha256, sharedSecret, new Uint8Array(32), new TextEncoder().encode('ecies-hkdf'), 32);
    const encryptionKey = derivedKeys.slice(0, 16); // AES-128
    const macKey = derivedKeys.slice(16, 32);

    // Generate random IV
    const iv = randomBytes(16);

    // Encrypt the message using AES-CTR
    const messageBytes = new TextEncoder().encode(message);
    const cipher = ctr(encryptionKey, iv);
    const ciphertext = cipher.encrypt(messageBytes);

    // Generate MAC using HMAC-SHA256
    const macData = new Uint8Array([...iv, ...ciphertext]);
    const macBytes = hmac(sha256, macKey, macData);

    // Return in the format expected by eth-crypto
    return {
        iv: Buffer.from(iv).toString('hex'),
        ephemPublicKey: Buffer.from(ephemeralPublicKey).toString('hex'),
        ciphertext: Buffer.from(ciphertext).toString('hex'),
        mac: Buffer.from(macBytes).toString('hex')
    };
}