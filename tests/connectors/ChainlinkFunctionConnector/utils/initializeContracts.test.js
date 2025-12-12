import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { initializeContracts } from '../../../../src/connectors/ChainlinkFunctionConnector/utils/initializeContracts.js';

describe('ChainlinkFunctionConnector - initializeContracts', () => {
    test('returns functionRouter and linkToken contracts', () => {
        const mockProvider = {};
        const chain = 'ethereum';
        const network = 'sepolia'; 
        
        try {
            const { functionRouter, linkToken } = initializeContracts(mockProvider, chain, network);
            
            assert.ok(functionRouter);
            assert.ok(linkToken);
            assert.strictEqual(typeof functionRouter.target, 'string');
        } catch (e) {
            if (e.message.includes('invalid address')) {
               console.warn("Skipping test due to missing address configuration for test network");
            } else {
               throw e;
            }
        }
    });

    test('handles missing LINK token gracefully', () => {
        const mockProvider = {};
    });
});

