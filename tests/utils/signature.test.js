import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { parseSignature } from '../../src/utils/parseSignature.js';
import { formatSignature } from '../../src/utils/signatureToHex.js';

describe('Utils - Signature Parsing', () => {
    test('parseSignature extracts r, s, v', async () => {
        const wallet = ethers.Wallet.createRandom();
        const sig = await wallet.signMessage("Hello");
        const parsed = parseSignature(sig);
        
        assert.ok(parsed.r);
        assert.ok(parsed.s);
        assert.ok(parsed.v);
        
        const reconstructed = formatSignature(parsed.r, parsed.s, parsed.v);
        assert.strictEqual(reconstructed, sig);
    });
});

