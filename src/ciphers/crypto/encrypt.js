import { secp256k1 } from '@noble/curves/secp256k1.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { xchacha20 } from './xchacha20.js';
import { KDF_SALT, KDF_INFO, KEY_LENGTH } from './constants.js';

/**
 * Encrypts data using the public key.
 * @param {Uint8Array} publicKey - The public key.
 * @param {string} data - The string data to encrypt.
 * @returns {Uint8Array} The encrypted message
 */
export async function encrypt(publicKey, data) {
    const ephemeralPrivateKey = secp256k1.utils.randomSecretKey();
    const ephemeralPublicKey = secp256k1.getPublicKey(ephemeralPrivateKey);

    const sharedSecretPoint = secp256k1.getSharedSecret(ephemeralPrivateKey, publicKey);

    const symmetricKey = await hkdf(
        sha256,
        sharedSecretPoint, 
        KDF_SALT,
        KDF_INFO,
        KEY_LENGTH
    );

    const ciphertextWithNonce = xchacha20.encrypt(data, symmetricKey);

    const result = new Uint8Array(ephemeralPublicKey.length + ciphertextWithNonce.length);
    result.set(ephemeralPublicKey, 0);
    result.set(ciphertextWithNonce, ephemeralPublicKey.length);

    return result;
}
