import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateKeyPair } from '../../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Crypto - Keygen', () => {
    test('generateKeyPair returns private and public keys', () => {
        const { privateKey, publicKey } = generateKeyPair();
        assert.ok(privateKey, 'Private key should exist');
        assert.ok(publicKey, 'Public key should exist');
        assert.equal(privateKey.length, 32, 'Private key should be 32 bytes');
        assert.equal(publicKey.length, 33, 'Public key length should be 33 bytes');
    });
});

