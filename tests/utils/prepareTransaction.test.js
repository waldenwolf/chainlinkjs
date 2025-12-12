import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ethers } from 'ethers';
import { prepareTransaction } from '../../src/utils/prepareTransaction.js';

describe('Utils - prepareTransaction', () => {
    test('prepares transaction with estimated gas', async () => {
        const mockProvider = {
            getFeeData: async () => ({
                maxFeePerGas: 100n,
                maxPriorityFeePerGas: 10n,
                gasPrice: 50n
            }),
            estimateGas: async () => 21000n,
            getNetwork: async () => ({ chainId: 1n })
        };
        
        const txParams = { to: '0x123', value: ethers.parseEther('1') };
        const from = '0xSender';
        const nonce = 5;
        
        const tx = await prepareTransaction(mockProvider, txParams, from, nonce);
        
        assert.strictEqual(tx.to, txParams.to);
        assert.strictEqual(tx.value, txParams.value);
        assert.strictEqual(tx.nonce, nonce);
        assert.strictEqual(tx.gasLimit, 25200n); 
        assert.strictEqual(tx.chainId, 1n);
        assert.strictEqual(tx.maxFeePerGas, 100n);
        assert.strictEqual(tx.maxPriorityFeePerGas, 10n);
    });
});

