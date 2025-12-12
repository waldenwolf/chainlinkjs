import { test, describe } from 'node:test';
import assert from 'node:assert';
import { rawToDer } from '../../src/utils/rawToDer.js';

describe('Utils - rawToDer', () => {
    test('rawToDer converts raw signature to DER format', () => {
        const r = Buffer.alloc(32, 1);
        const s = Buffer.alloc(32, 2);
        const v = Buffer.from([27]);
        const raw = Buffer.concat([r, s, v]);
        
        const der = rawToDer(raw);
        
        assert.strictEqual(der[0], 0x30);
        
        assert.ok(der.length > 64);
    });
});

