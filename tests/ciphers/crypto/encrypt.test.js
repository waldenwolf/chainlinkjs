import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encrypt } from '../../../src/ciphers/crypto/encrypt.js';
import { decrypt } from '../../../src/ciphers/crypto/decrypt.js';
import { generateKeyPair } from '../../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Crypto - Encrypt', () => {
    test('encrypts data that can be decrypted', async () => {
        const alice = generateKeyPair();
        const message = 'Secret Message For Encrypt Test';
        
        const encrypted = await encrypt(alice.publicKey, message);
        assert.ok(encrypted instanceof Uint8Array);
        
        const decrypted = await decrypt(encrypted, alice.privateKey);
        assert.strictEqual(decrypted, message);
    });
});

