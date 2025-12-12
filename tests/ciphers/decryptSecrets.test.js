import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encryptSecrets } from '../../src/ciphers/encryptSecrets.js';
import { decryptSecrets } from '../../src/ciphers/decryptSecrets.js';
import { generateKeyPair } from '../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Decrypt Secrets', () => {
    test('decryptSecrets decrypts properly', async () => {
        const { privateKey, publicKey } = generateKeyPair();
        const secrets = ['FOO=bar', 'TEST=test'];
        
        const encrypted = await encryptSecrets(secrets, publicKey);
        const decrypted = await decryptSecrets(encrypted, privateKey);
        
        assert.deepStrictEqual(decrypted, {
            FOO: 'bar',
            TEST: 'test'
        });
    });
});

