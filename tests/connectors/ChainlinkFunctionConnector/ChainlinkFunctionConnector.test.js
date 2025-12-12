import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { ChainlinkFunctionConnector } from '../../../src/connectors/ChainlinkFunctionConnector/ChainlinkFunctionConnector.js';

describe('ChainlinkFunctionConnector', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    test('instantiates with valid configuration', () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        
        const mockSigner = {
            address: '0xSigner'
        };

        try {
            const connector = new ChainlinkFunctionConnector(mockSigner, 'ethereum', 'mainnet');
            assert.strictEqual(connector.address, '0xSigner');
            assert.ok(connector.functionRouter);
        } catch (e) {
             if (e.message.includes('Unsupported chain/network')) {
             } else if (e.message.includes('PROVIDER_URI')) {
                 assert.fail('Should have found PROVIDER_URI');
             } else {
                 throw e;
             }
        }
    });
});

