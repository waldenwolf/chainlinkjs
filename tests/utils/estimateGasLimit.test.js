import { test, describe } from 'node:test';
import assert from 'node:assert';
import { estimateGasLimit } from '../../src/utils/estimateGasLimit.js';

describe('Utils - estimateGasLimit', () => {
    test('returns predefined gasLimit if present', async () => {
        const txParams = { gasLimit: 50000n };
        const limit = await estimateGasLimit(null, txParams, null);
        assert.strictEqual(limit, 50000n);
    });

    test('estimates gas and adds buffer', async () => {
        const mockProvider = {
            estimateGas: async () => 21000n
        };
        const txParams = { to: '0x123', value: 0n };
        
        const limit = await estimateGasLimit(mockProvider, txParams, '0xSender');
        
        assert.strictEqual(limit, 25200n);
    });
});

