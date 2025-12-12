import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { getProvider } from '../../src/utils/getProvider.js';
import { initializeProvider } from '../../src/utils/initializeProvider.js';

describe('Utils - Provider', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    test('getProvider throws if PROVIDER_URI missing', () => {
        delete process.env.PROVIDER_URI;
        assert.throws(() => getProvider(), /PROVIDER_URI not found/);
    });

    test('getProvider returns JsonRpcProvider', () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        process.env.CHAIN = 'ethereum';
        process.env.NETWORK = 'mainnet';
        
        const provider = getProvider();
        assert.ok(provider);
    });

    test('initializeProvider returns object with provider', () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        const result = initializeProvider();
        assert.ok(result.provider);
    });
});

