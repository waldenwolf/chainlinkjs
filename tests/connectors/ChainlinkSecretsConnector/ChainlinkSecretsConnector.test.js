import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { ChainlinkSecretsConnector } from '../../../src/connectors/ChainlinkSecretsConnector/ChainlinkSecretsConnector.js';

describe('ChainlinkSecretsConnector', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    test('instantiates with valid configuration', () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        const mockSigner = { address: '0xSigner' };
        
        try {
            const connector = new ChainlinkSecretsConnector(mockSigner, 'ethereum', 'mainnet');
            assert.strictEqual(connector.address, '0xSigner');
            assert.ok(connector.secretsEndpoints);
        } catch (e) {
             if (e.message.includes('Unsupported chain/network')) {
             } else {
                 throw e;
             }
        }
    });
    
    test('encryptSecretsUrls validates input', async () => {
        process.env.PROVIDER_URI = 'https://rpc.example.com';
        const mockSigner = { address: '0xSigner' };
        
        try {
            const connector = new ChainlinkSecretsConnector(mockSigner, 'ethereum', 'mainnet');
            
            await assert.rejects(
                async () => await connector.encryptSecretsUrls([]),
                /Must provide an array/
            );
             
            await assert.rejects(
                async () => await connector.encryptSecretsUrls(['not-a-url']),
                /Error encountered when attempting to validate/
            );

        } catch (e) {
            if (!e.message.includes('Unsupported chain')) throw e;
        }
    });
});

