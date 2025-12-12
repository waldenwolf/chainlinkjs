import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encrypt } from '../../../src/ciphers/crypto/tdh2.js';
import { generateKeyPair } from '../../../src/ciphers/crypto/keygen.js';
import { p256 } from '@noble/curves/nist.js';

describe('Ciphers - Crypto - TDH2', () => {
    test('encrypt produces expected structure', () => {
        const priv1 = p256.utils.randomSecretKey();
        const priv2 = p256.utils.randomSecretKey();
        const gBar = p256.Point.BASE.multiply(BigInt('0x' + Buffer.from(priv1).toString('hex')));
        const h = p256.Point.BASE.multiply(BigInt('0x' + Buffer.from(priv2).toString('hex')));
        
        const pub = {
            Group: 'P256',
            G_bar: Buffer.from(gBar.toBytes(false)).toString('base64'),
            H: Buffer.from(h.toBytes(false)).toString('base64')
        };
        
        const msg = "TDH2 Test Message";
        const encryptedJSON = encrypt(pub, msg);
        
        const encrypted = JSON.parse(encryptedJSON);
        assert.ok(encrypted.TDH2Ctxt);
        assert.ok(encrypted.SymCtxt);
        assert.ok(encrypted.Nonce);
    });
});

