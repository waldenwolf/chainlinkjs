import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encryptWithPublicKey } from '../../src/ciphers/encrypt-with-public-key.js';
import { generateKeyPair } from '../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Encrypt With Public Key', () => {
    test('encryptWithPublicKey', async () => {
        const { publicKey } = generateKeyPair();
        const message = "Hello EthCrypto";
        const encrypted = await encryptWithPublicKey(publicKey, message);
        
        assert.ok(encrypted.iv);
        assert.ok(encrypted.ephemPublicKey);
        assert.ok(encrypted.ciphertext);
        assert.ok(encrypted.mac);
        
        assert.match(encrypted.iv, /^[0-9a-f]+$/i);
        assert.match(encrypted.ephemPublicKey, /^[0-9a-f]+$/i);
        assert.match(encrypted.ciphertext, /^[0-9a-f]+$/i);
        assert.match(encrypted.mac, /^[0-9a-f]+$/i);
    });
});

