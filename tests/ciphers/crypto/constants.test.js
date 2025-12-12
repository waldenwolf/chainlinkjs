import { test, describe } from 'node:test';
import assert from 'node:assert';
import { KDF_SALT, KDF_INFO, KEY_LENGTH, PUB_KEY_LEN } from '../../../src/ciphers/crypto/constants.js';

describe('Ciphers - Crypto - Constants', () => {
    test('constants have correct values and types', () => {
        assert.ok(KDF_SALT instanceof Uint8Array);
        assert.strictEqual(KDF_SALT.length, 32);
        
        assert.ok(KDF_INFO instanceof Uint8Array);
        assert.strictEqual(new TextDecoder().decode(KDF_INFO), 'noble-xchacha-ecies');
        
        assert.strictEqual(KEY_LENGTH, 32);
        assert.strictEqual(PUB_KEY_LEN, 33);
    });
});

