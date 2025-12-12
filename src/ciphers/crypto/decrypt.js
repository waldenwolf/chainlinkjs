import { secp256k1 } from '@noble/curves/secp256k1.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { xchacha20 } from './xchacha20.js';
import { KDF_SALT, KDF_INFO, KEY_LENGTH, PUB_KEY_LEN } from './constants.js';

/**
 * Decrypts data using the private key.
 * @param {Uint8Array} privateKey - The private key.
 * @param {Uint8Array} encryptedData - The encrypted data.
 * @returns {string} The decrypted message.
 */
export async function decrypt(encryptedData, privateKey) {
    const ephemeralPublicKey = encryptedData.slice(0, PUB_KEY_LEN);
    const ciphertextWithNonce = encryptedData.slice(PUB_KEY_LEN);

    const sharedSecretPoint = secp256k1.getSharedSecret(privateKey, ephemeralPublicKey);

    const symmetricKey = await hkdf(
        sha256,
        sharedSecretPoint,
        KDF_SALT,
        KDF_INFO,
        KEY_LENGTH
    );

    return xchacha20.decrypt(ciphertextWithNonce, symmetricKey);
}
