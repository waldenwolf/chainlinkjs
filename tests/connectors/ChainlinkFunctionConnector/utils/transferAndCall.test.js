import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { transferAndCall } from '../../../../src/connectors/ChainlinkFunctionConnector/utils/transferAndCall.js';

describe('ChainlinkFunctionConnector - transferAndCall', () => {
    test('calls transferAndCall on token contract', async () => {
        const mockSigner = {
            sendTransaction: async (tx) => ({
                wait: async () => ({ hash: '0xhash' })
            })
        };
        
        const mockTokenContract = {
            target: '0xToken',
            decimals: async () => 18n,
            interface: {
                encodeFunctionData: (fn, args) => {
                    assert.strictEqual(fn, 'transferAndCall');
                    assert.strictEqual(args[0], '0xRouter');
                    return '0xencodedData';
                }
            }
        };

        const result = await transferAndCall(
            mockTokenContract, 
            '0xRouter', 
            '1.0', 
            '123', 
            mockSigner
        );

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.transactionHash, '0xhash');
        assert.strictEqual(result.subscriptionId, '123');
    });

    test('throws if tokenContract is missing', async () => {
        await assert.rejects(
            async () => await transferAndCall(null, '0xRouter', '1.0', '1', {}),
            /LINK token required/
        );
    });
});

