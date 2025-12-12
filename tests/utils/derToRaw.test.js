import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { derToRaw } from '../../src/utils/derToRaw.js';

describe('Utils - derToRaw', () => {
    test('extracts raw key from DER', () => {
        const rawKey = new Uint8Array(64).fill(1);
        const uncompressed = Buffer.concat([Buffer.from([0x04]), rawKey]);
        
        const bitStringPayload = Buffer.concat([Buffer.from([0x00]), uncompressed]);
        const bitString = Buffer.concat([Buffer.from([0x03, bitStringPayload.length]), bitStringPayload]);
        
        const der = Buffer.concat([Buffer.from([0x30, bitString.length]), bitString]);
        
        const extracted = derToRaw(der);
        assert.strictEqual(extracted, Buffer.from(rawKey).toString('hex'));
    });
    
    test('throws if BIT STRING not found', () => {
        const badDer = Buffer.from([0x30, 0x00]);
        assert.throws(() => derToRaw(badDer), /Could not find BIT STRING/);
    });
});

