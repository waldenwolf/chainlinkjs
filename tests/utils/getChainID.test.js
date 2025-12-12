import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { getChainID } from '../../src/utils/getChainID.js';

describe('Utils - getChainID', () => {
    const originalEnv = process.env;
    
    afterEach(() => {
        process.env = originalEnv;
    });

    test('throws if CHAIN or NETWORK missing', () => {
        delete process.env.CHAIN;
        assert.throws(() => getChainID(), /CHAIN not found/);
        
        process.env.CHAIN = 'ethereum';
        delete process.env.NETWORK;
        assert.throws(() => getChainID(), /NETWORK not found/);
    });

    test('returns correct chain IDs', () => {
        process.env.CHAIN = 'ethereum';
        process.env.NETWORK = 'mainnet';
        assert.strictEqual(getChainID(), 1);
        
        process.env.NETWORK = 'testnet';
        assert.strictEqual(getChainID(), 11155111);
        
        process.env.CHAIN = 'polygon';
        process.env.NETWORK = 'mainnet';
        assert.strictEqual(getChainID(), 137);
    });
    
    test('throws on unsupported chain', () => {
        process.env.CHAIN = 'solana';
        process.env.NETWORK = 'mainnet';
        assert.throws(() => getChainID(), /Unsupported chain/);
    });
});

