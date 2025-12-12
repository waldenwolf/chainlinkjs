import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encryptSecrets } from '../../src/ciphers/encryptSecrets.js';
import { decryptSecrets } from '../../src/ciphers/decryptSecrets.js';
import { generateKeyPair } from '../../src/ciphers/crypto/keygen.js';

describe('Ciphers - Encrypt Secrets', () => {
    test('encryptSecrets', async () => {
        const { privateKey, publicKey } = generateKeyPair();
        const secrets = ['KEY1=value1', 'KEY2=value2'];
        
        const encrypted = await encryptSecrets(secrets, publicKey);
        assert.strictEqual(typeof encrypted, 'string');
        
        const decrypted = await decryptSecrets(encrypted, privateKey);
        assert.deepStrictEqual(decrypted, {
            KEY1: 'value1',
            KEY2: 'value2'
        });
    });
});

