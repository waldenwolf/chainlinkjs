import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encrypt } from '../../../src/ciphers/crypto/encrypt.js';
import { decrypt } from '../../../src/ciphers/crypto/decrypt.js';
import { generateKeyPair } from '../../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Crypto - Decrypt', () => {
    test('decrypts encrypted data', async () => {
        const alice = generateKeyPair();
        const message = 'Secret Message For Decrypt Test';
        
        const encrypted = await encrypt(alice.publicKey, message);
        const decrypted = await decrypt(encrypted, alice.privateKey);
        
        assert.strictEqual(decrypted, message);
    });
});

