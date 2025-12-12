import { test, describe } from 'node:test';
import assert from 'node:assert';
import { xchacha20 } from '../../../src/ciphers/crypto/xchacha20.js';
import { random } from '../../../src/ciphers/crypto/random.js';

describe('Ciphers - Crypto - XChaCha20', () => {
    test('encrypt and decrypt cycle', () => {
        const key = random.bytes(32);
        const data = 'Hello World';
        
        const encrypted = xchacha20.encrypt(data, key);
        assert.ok(encrypted instanceof Uint8Array);
        assert.ok(encrypted.length > data.length); 
        const decrypted = xchacha20.decrypt(encrypted, key);
        assert.strictEqual(decrypted, data);
    });

    test('decrypt with nonce', () => {
        const key = random.bytes(32);
        const nonce = random.bytes(24);
        const data = 'Hello World';
        const encrypted = xchacha20.encrypt(data, key, nonce);
        const decrypted = xchacha20.decrypt(encrypted, key, nonce);
        assert.strictEqual(decrypted, data);
    });
});

