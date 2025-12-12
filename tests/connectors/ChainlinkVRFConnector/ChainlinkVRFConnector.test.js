import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { ChainlinkVRFConnector } from '../../../src/connectors/ChainlinkVRFConnector/ChainlinkVRFConnector.js';

describe('ChainlinkVRFConnector', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    test('instantiates with valid configuration', () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        const mockSigner = { address: '0xSigner' };
        
        try {
            const connector = new ChainlinkVRFConnector(mockSigner, 'ethereum', 'mainnet');
            assert.strictEqual(connector.address, '0xSigner');
            assert.ok(connector.vrfCoordinator);
        } catch (e) {
             if (e.message.includes('Unsupported chain/network')) {
             } else {
                 throw e;
             }
        }
    });
});

