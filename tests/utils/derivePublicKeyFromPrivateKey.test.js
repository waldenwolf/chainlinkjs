import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { derivePublicKeyFromPrivateKey } from '../../src/utils/derivePublicKeyFromPrivateKey.js';

describe('Utils - derivePublicKeyFromPrivateKey', () => {
    test('derives correct public key', () => {
        const wallet = ethers.Wallet.createRandom();
        const derived = derivePublicKeyFromPrivateKey(wallet.privateKey);
        const expectedHex = wallet.signingKey.publicKey.slice(2);
        const derivedHex = Buffer.from(derived).toString('hex');
        
        assert.strictEqual(derivedHex, expectedHex);
    });
});

