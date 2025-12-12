import { test, describe } from 'node:test';
import assert from 'node:assert';
import { random } from '../../../src/ciphers/crypto/random.js';

describe('Ciphers - Crypto - Random', () => {
    test('random.bytes returns Buffer/Uint8Array of correct length', () => {
        const len = 32;
        const bytes = random.bytes(len);
        assert.strictEqual(bytes.length, len);
        assert.ok(!bytes.every(b => b === 0));
    });
});

