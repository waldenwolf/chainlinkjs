import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { random } from './random.js';

export const xchacha20 = {
    encrypt: (data, privateKey, nonce) => {
        const shouldGenerateNonce = (nonce === undefined);
        if (shouldGenerateNonce) {
            nonce = random.bytes(24);
        }

        const input = new TextEncoder().encode(data);
        const encrypted = xchacha20poly1305(privateKey, nonce).encrypt(input);

        if (shouldGenerateNonce) {
            const result = new Uint8Array(nonce.length + encrypted.length);
            result.set(nonce, 0);
            result.set(encrypted, nonce.length);
            return result;
        } else {
            return encrypted;
        }
    },

    decrypt: (encryptedData, privateKey,  nonce = undefined) => {
        let ciphertext;

        if (nonce === undefined) {
            nonce = encryptedData.slice(0, 24);
            ciphertext = encryptedData.slice(24);
        } else {
            ciphertext = encryptedData;
        }

        const decrypted = xchacha20poly1305(privateKey, nonce).decrypt(ciphertext);
        return new TextDecoder().decode(decrypted);
    }
};